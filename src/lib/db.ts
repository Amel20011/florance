import fs from 'node:fs';
import path from 'node:path';
import { Order, WebhookEvent, UserProfile } from '../types.js';

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  provider: 'google' | 'apple' | 'email' | 'whatsapp';
  isVerified: boolean;
  registeredAt: string;
  lastLoginAt: string;
  role?: string;
}

export interface EmailOtpRecord {
  id: string;
  email: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  used: boolean;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

interface DatabaseSchema {
  orders: Order[];
  webhook_events: WebhookEvent[];
  user_balances: Record<string, number>;
  users?: RegisteredUser[];
  email_otps?: EmailOtpRecord[];
  sessions?: SessionRecord[];
}

// 8-Digit Admin Access Code (Secret validation - NOT displayed on UI)
export const ADMIN_ACCESS_CODE = 'A10293847';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'florance-db.json');

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      orders: [],
      webhook_events: [],
      user_balances: {},
      users: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.user_balances) {
      parsed.user_balances = {};
    }
    if (!parsed.users) {
      parsed.users = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading florance-db.json, resetting to empty schema', err);
    const initial: DatabaseSchema = { orders: [], webhook_events: [], user_balances: {}, users: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database file', err);
  }
}

// ---------------- Order Operations ---------------- //

export function createOrder(order: Order): Order {
  const db = ensureDb();
  db.orders.unshift(order);
  saveDb(db);
  return order;
}

export function getOrderById(id: string): Order | undefined {
  const db = ensureDb();
  return db.orders.find((o) => o.id === id);
}

export function getOrderByInvoice(invoice: string): Order | undefined {
  const db = ensureDb();
  return db.orders.find((o) => o.invoice === invoice);
}

export function getOrderByGatewayId(gatewayTransactionId: string): Order | undefined {
  const db = ensureDb();
  return db.orders.find((o) => o.gatewayTransactionId === gatewayTransactionId);
}

export function getOrdersByUser(userId: string): Order[] {
  const db = ensureDb();
  return db.orders.filter((o) => o.userId === userId);
}

export function getAllOrders(): Order[] {
  const db = ensureDb();
  return [...db.orders];
}

export function updateOrderStatus(
  gatewayTransactionId: string,
  newStatus: Order['paymentStatus'],
  paidAt?: string,
  fulfillmentData?: Order['fulfillmentData']
): Order | null {
  const db = ensureDb();
  const orderIndex = db.orders.findIndex(
    (o) => o.gatewayTransactionId === gatewayTransactionId || o.id === gatewayTransactionId
  );

  if (orderIndex === -1) {
    return null;
  }

  const currentOrder = db.orders[orderIndex];

  // Payment state protection: if already PAID, do not downgrade
  if (currentOrder.paymentStatus === 'PAID' && newStatus !== 'PAID') {
    return currentOrder;
  }

  currentOrder.paymentStatus = newStatus;
  if (paidAt) {
    currentOrder.paidAt = paidAt;
  }
  if (newStatus === 'PAID') {
    currentOrder.fulfillmentStatus = 'COMPLETED';
    if (!currentOrder.paidAt) {
      currentOrder.paidAt = new Date().toISOString();
    }
    if (fulfillmentData) {
      currentOrder.fulfillmentData = fulfillmentData;
    } else if (!currentOrder.fulfillmentData) {
      // Generate realistic fulfillment deliverable
      currentOrder.fulfillmentData = generateFulfillment(currentOrder);
    }

    // If this is a deposit order, credit user balance!
    if (currentOrder.productId === 'deposit') {
      if (!db.user_balances) db.user_balances = {};
      const amount = currentOrder.amount;
      
      const keysToCredit = new Set<string>();
      if (currentOrder.userId && currentOrder.userId !== 'guest') keysToCredit.add(currentOrder.userId);
      if (currentOrder.userEmail && currentOrder.userEmail !== 'guest@florance.store') {
        keysToCredit.add(currentOrder.userEmail.toLowerCase().trim());
      }

      for (const key of keysToCredit) {
        const cur = db.user_balances[key] || 0;
        db.user_balances[key] = cur + amount;
      }
    }
  }

  db.orders[orderIndex] = currentOrder;
  saveDb(db);
  return currentOrder;
}

export function cancelOrder(orderKey: string, reason?: string): Order | null {
  const db = ensureDb();
  const orderIndex = db.orders.findIndex(
    (o) => o.gatewayTransactionId === orderKey || o.id === orderKey || o.invoice === orderKey
  );

  if (orderIndex === -1) {
    return null;
  }

  const currentOrder = db.orders[orderIndex];
  if (currentOrder.paymentStatus === 'PAID') {
    return currentOrder;
  }

  currentOrder.paymentStatus = 'FAILED';
  currentOrder.fulfillmentStatus = 'FAILED';
  currentOrder.fulfillmentData = {
    instructions: reason || 'Pesanan dibatalkan oleh pengguna.',
  };

  db.orders[orderIndex] = currentOrder;
  saveDb(db);
  return currentOrder;
}

function generateFulfillment(order: Order): Order['fulfillmentData'] {
  if (order.productId.includes('pulsa') || order.productId.includes('data')) {
    return {
      snNumber: `SN${Date.now().toString().slice(-10)}/${order.targetAccount}`,
      instructions: `Pulsa/Data berhasil dikirim ke nomor ${order.targetAccount}. Status transaksi: SUKSES (Ref: FLR-TOPUP-${Date.now()})`,
    };
  }
  if (order.productId.includes('token-pln')) {
    const t1 = Math.floor(1000 + Math.random() * 9000);
    const t2 = Math.floor(1000 + Math.random() * 9000);
    const t3 = Math.floor(1000 + Math.random() * 9000);
    const t4 = Math.floor(1000 + Math.random() * 9000);
    const t5 = Math.floor(1000 + Math.random() * 9000);
    return {
      licenseKey: `${t1}-${t2}-${t3}-${t4}-${t5}`,
      instructions: `Nomor Token Stroom PLN Prabayar (20 Digit): ${t1}-${t2}-${t3}-${t4}-${t5} untuk ID Pelanggan: ${order.targetAccount}. Masukkan ke kWh meter Anda.`,
    };
  }
  if (order.productId.includes('bot-whatsapp') || order.productId.includes('sewa-bot')) {
    return {
      licenseKey: `FLR-BOT-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      botWebhookUrl: `https://florance.bot/api/v1/session/${order.invoice.toLowerCase()}`,
      instructions: `Akses pairing code dan link sesi bot WhatsApp Anda telah aktif. Hubungi CS Florance atau masukkan license key di panel bot Anda.`,
    };
  }
  if (order.productId === 'deposit') {
    return {
      snNumber: `DEP-${Date.now().toString().slice(-8)}`,
      instructions: `Deposit Saldo Florance sebesar Rp ${order.amount.toLocaleString('id-ID')} telah sukses dikreditkan ke saldo akun Anda. Saldo dapat langsung digunakan untuk transaksi.`,
    };
  }
  return {
    licenseKey: `FLR-LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    instructions: `Layanan digital Anda sedang aktif dan diproses tim teknis Florance. Simpan kode lisensi Anda.`,
  };
}

// ---------------- User Balance Operations ---------------- //

export function getUserBalance(userId: string, userEmail?: string): number {
  if (!userId && !userEmail) return 0;
  const db = ensureDb();
  if (!db.user_balances) db.user_balances = {};

  const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : '';
  const balById = userId ? db.user_balances[userId] : undefined;
  const balByEmail = cleanEmail ? db.user_balances[cleanEmail] : undefined;

  if (balById !== undefined && balByEmail !== undefined) {
    const highest = Math.max(balById, balByEmail);
    // Keep them synced
    db.user_balances[userId] = highest;
    db.user_balances[cleanEmail] = highest;
    saveDb(db);
    return highest;
  }

  if (balById !== undefined) {
    if (cleanEmail) {
      db.user_balances[cleanEmail] = balById;
      saveDb(db);
    }
    return balById;
  }

  if (balByEmail !== undefined) {
    if (userId) {
      db.user_balances[userId] = balByEmail;
      saveDb(db);
    }
    return balByEmail;
  }

  return 0;
}

export function addBalance(userId: string, amount: number, userEmail?: string): number {
  if (amount <= 0) return getUserBalance(userId, userEmail);
  const db = ensureDb();
  if (!db.user_balances) db.user_balances = {};

  const currentBal = getUserBalance(userId, userEmail);
  const newBal = currentBal + amount;

  if (userId) db.user_balances[userId] = newBal;
  if (userEmail) db.user_balances[userEmail.toLowerCase().trim()] = newBal;

  saveDb(db);
  return newBal;
}

export function deductBalance(userId: string, amount: number, userEmail?: string): boolean {
  if (amount <= 0) return false;
  const db = ensureDb();
  if (!db.user_balances) db.user_balances = {};

  const currentBal = getUserBalance(userId, userEmail);
  if (currentBal < amount) return false;

  const newBal = currentBal - amount;
  if (userId) db.user_balances[userId] = newBal;
  if (userEmail) db.user_balances[userEmail.toLowerCase().trim()] = newBal;

  saveDb(db);
  return true;
}

// ---------------- Webhook Event Idempotency ---------------- //

export function isWebhookEventProcessed(eventId: string): boolean {
  const db = ensureDb();
  return db.webhook_events.some((e) => e.event_id === eventId);
}

export function recordWebhookEvent(eventId: string, transactionId: string): boolean {
  const db = ensureDb();
  if (db.webhook_events.some((e) => e.event_id === eventId)) {
    return false; // already exists
  }
  const event: WebhookEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event_id: eventId,
    transaction_id: transactionId,
    processed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  db.webhook_events.push(event);
  saveDb(db);
  return true;
}

// ---------------- Registered Users Database Operations ---------------- //

export function findUserByEmail(email: string): RegisteredUser | undefined {
  if (!email) return undefined;
  const cleanEmail = email.toLowerCase().trim();
  const db = ensureDb();
  return db.users?.find((u) => u.email.toLowerCase().trim() === cleanEmail);
}

export function findUserById(id: string): RegisteredUser | undefined {
  if (!id) return undefined;
  const db = ensureDb();
  return db.users?.find((u) => u.id === id);
}

export const getUserById = findUserById;
export const getUserByEmail = findUserByEmail;

export function getAllRegisteredUsers(): RegisteredUser[] {
  const db = ensureDb();
  return db.users || [];
}

export function registerUser(
  userData: Omit<RegisteredUser, 'id' | 'registeredAt' | 'lastLoginAt'> & { id?: string },
  accessCode: string
): { success: boolean; user?: RegisteredUser; error?: string } {
  const cleanCode = (accessCode || '').trim().toUpperCase();
  if (cleanCode !== ADMIN_ACCESS_CODE) {
    return {
      success: false,
      error: 'Kode akses pendaftaran 8-digit tidak valid. Silakan hubungi Admin Florance untuk mendapatkan kode akses resmi.',
    };
  }

  const cleanEmail = userData.email.toLowerCase().trim();
  if (!cleanEmail) {
    return { success: false, error: 'Alamat email wajib diisi.' };
  }

  const db = ensureDb();
  if (!db.users) db.users = [];

  const existingIndex = db.users.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    // Update existing user
    const existing = db.users[existingIndex];
    const updated: RegisteredUser = {
      ...existing,
      name: userData.name || existing.name,
      phone: userData.phone || existing.phone,
      avatar: userData.avatar || existing.avatar,
      bio: userData.bio || existing.bio,
      lastLoginAt: now,
    };
    db.users[existingIndex] = updated;
    saveDb(db);
    return { success: true, user: updated };
  }

  const newId = userData.id || `usr_${userData.provider}_${Date.now().toString(36)}`;
  const newUser: RegisteredUser = {
    id: newId,
    email: cleanEmail,
    name: userData.name || cleanEmail.split('@')[0],
    phone: userData.phone || '081234567890',
    avatar:
      userData.avatar ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80`,
    bio: userData.bio || 'Pelanggan Terverifikasi Florance Digital',
    provider: userData.provider,
    isVerified: true,
    registeredAt: now,
    lastLoginAt: now,
  };

  db.users.push(newUser);
  saveDb(db);
  return { success: true, user: newUser };
}

export function updateUserProfileInDb(updated: Partial<RegisteredUser> & { email: string }): RegisteredUser | null {
  const db = ensureDb();
  if (!db.users) db.users = [];
  const cleanEmail = updated.email.toLowerCase().trim();
  const index = db.users.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail || u.id === updated.id);
  if (index === -1) {
    return null;
  }
  const current = db.users[index];
  const merged: RegisteredUser = {
    ...current,
    ...updated,
    lastLoginAt: new Date().toISOString(),
  };
  db.users[index] = merged;
  saveDb(db);
  return merged;
}

export function upsertOAuthUserInDb(userData: {
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'apple';
  sub?: string;
}): RegisteredUser {
  const db = ensureDb();
  if (!db.users) db.users = [];

  const cleanEmail = userData.email.toLowerCase().trim();
  const existingIndex = db.users.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    const existing = db.users[existingIndex];
    const updated: RegisteredUser = {
      ...existing,
      name: userData.name || existing.name,
      avatar: userData.avatar || existing.avatar,
      provider: userData.provider,
      isVerified: true,
      lastLoginAt: now,
    };
    db.users[existingIndex] = updated;
    saveDb(db);
    return updated;
  }

  const newId = userData.sub || `usr_${userData.provider}_${Date.now().toString(36)}`;
  const newUser: RegisteredUser = {
    id: newId,
    email: cleanEmail,
    name: userData.name || cleanEmail.split('@')[0],
    phone: '081234567890',
    avatar:
      userData.avatar ||
      (userData.provider === 'google'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80'),
    bio: `Pengguna Resmi ${userData.provider === 'google' ? 'Google' : 'Apple'} Terverifikasi Florance`,
    provider: userData.provider,
    isVerified: true,
    registeredAt: now,
    lastLoginAt: now,
    role: 'user',
  };

  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

// ---------------- Email OTP Operations ---------------- //

export function getRecentOtpForEmail(email: string, windowMs = 60000): EmailOtpRecord | undefined {
  const db = ensureDb();
  if (!db.email_otps) db.email_otps = [];
  const cleanEmail = email.toLowerCase().trim();
  const cutoff = new Date(Date.now() - windowMs).getTime();

  return db.email_otps.find((record) => {
    return record.email === cleanEmail && new Date(record.createdAt).getTime() >= cutoff;
  });
}

export function invalidateAllOtpsForEmail(email: string): void {
  const db = ensureDb();
  if (!db.email_otps) db.email_otps = [];
  const cleanEmail = email.toLowerCase().trim();

  let modified = false;
  db.email_otps.forEach((rec) => {
    if (rec.email === cleanEmail && !rec.used) {
      rec.used = true;
      modified = true;
    }
  });

  if (modified) saveDb(db);
}

export function createEmailOtpRecord(params: {
  email: string;
  otpHash: string;
  expiresAt: string;
}): EmailOtpRecord {
  const db = ensureDb();
  if (!db.email_otps) db.email_otps = [];
  const cleanEmail = params.email.toLowerCase().trim();

  const record: EmailOtpRecord = {
    id: `otp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    otpHash: params.otpHash,
    expiresAt: params.expiresAt,
    attempts: 0,
    used: false,
    createdAt: new Date().toISOString(),
  };

  db.email_otps.unshift(record);
  saveDb(db);
  return record;
}

export function getLatestUnusedOtp(email: string): EmailOtpRecord | undefined {
  const db = ensureDb();
  if (!db.email_otps) db.email_otps = [];
  const cleanEmail = email.toLowerCase().trim();

  return db.email_otps.find((rec) => rec.email === cleanEmail && !rec.used);
}

export function updateOtpRecord(
  id: string,
  updates: Partial<EmailOtpRecord>
): EmailOtpRecord | null {
  const db = ensureDb();
  if (!db.email_otps) db.email_otps = [];

  const index = db.email_otps.findIndex((rec) => rec.id === id);
  if (index === -1) return null;

  db.email_otps[index] = { ...db.email_otps[index], ...updates };
  saveDb(db);
  return db.email_otps[index];
}

export function upsertOtpVerifiedUserForPhone(phone: string): RegisteredUser {
  const db = ensureDb();
  if (!db.users) db.users = [];

  const cleanPhone = phone.trim();
  const existingIndex = db.users.findIndex((u) => u.phone === cleanPhone);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    const existing = db.users[existingIndex];
    const updated: RegisteredUser = {
      ...existing,
      isVerified: true,
      lastLoginAt: now,
    };
    db.users[existingIndex] = updated;
    saveDb(db);
    return updated;
  }

  const newId = `usr_wa_${Date.now().toString(36)}`;
  const newUser: RegisteredUser = {
    id: newId,
    email: `${cleanPhone}@whatsapp.user`,
    name: `User WhatsApp (${cleanPhone.slice(-4)})`,
    phone: cleanPhone,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
    bio: 'Pengguna Terverifikasi WhatsApp Florance Digital',
    provider: 'whatsapp',
    isVerified: true,
    registeredAt: now,
    lastLoginAt: now,
    role: 'user',
  };

  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

// ---------------- Session Store Operations ---------------- //

export function createDbSession(userId: string, expiresInDays = 30): SessionRecord {
  const db = ensureDb();
  if (!db.sessions) db.sessions = [];

  const sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const session: SessionRecord = {
    id: sessionId,
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  db.sessions.push(session);
  saveDb(db);
  return session;
}

export function getDbSession(sessionId: string): SessionRecord | undefined {
  const db = ensureDb();
  if (!db.sessions) return undefined;

  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return undefined;

  // If expired, clean up
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    deleteDbSession(sessionId);
    return undefined;
  }

  return session;
}

export function deleteDbSession(sessionId: string): void {
  const db = ensureDb();
  if (!db.sessions) return;

  const index = db.sessions.findIndex((s) => s.id === sessionId);
  if (index !== -1) {
    db.sessions.splice(index, 1);
    saveDb(db);
  }
}


