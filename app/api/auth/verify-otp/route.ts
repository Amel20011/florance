import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizePhoneNumber } from '@/src/lib/whatsapp.js';
import fs from 'node:fs';
import path from 'node:path';

const HASH_SECRET = process.env.OTP_HASH_SECRET || 'florance-secure-otp-hmac-key-2026';
const MAX_VERIFY_ATTEMPTS = 5;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'florance-db.json');

interface OtpRecord {
  id: string;
  phone: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  used: boolean;
  createdAt: string;
}

interface Database {
  whatsapp_otps?: OtpRecord[];
  users?: any[];
  user_balances?: Record<string, number>;
  sessions?: any[];
}

function withDbTransaction<T>(operation: (db: Database) => T): T {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  let db: Database = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
      db = {};
    }
  }

  if (!db.whatsapp_otps) db.whatsapp_otps = [];
  if (!db.users) db.users = [];
  if (!db.user_balances) db.user_balances = {};
  if (!db.sessions) db.sessions = [];

  const result = operation(db);

  const tempFile = `${DB_FILE}.lock.${Date.now()}.${Math.random()}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);

  return result;
}

function hashOtp(phone: string, otp: string): string {
  return crypto.createHmac('sha256', HASH_SECRET).update(`${phone}:${otp}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = body?.phone;
    const rawOtp = body?.otp;

    if (!rawPhone || !rawOtp) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INPUT', message: 'Nomor WhatsApp dan kode OTP wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhoneNumber(rawPhone);
    const cleanOtp = String(rawOtp).trim().replace(/\D/g, '');

    if (cleanOtp.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'INVALID_OTP_FORMAT', message: 'Kode OTP harus berupa 6 digit angka.' },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Transactional verification
    const verificationResult = withDbTransaction((db) => {
      const record = db.whatsapp_otps?.find((rec) => rec.phone === cleanPhone && !rec.used);

      if (!record) {
        return { success: false, error: 'OTP_NOT_FOUND', message: 'Tidak ada permintaan OTP aktif untuk nomor ini. Silakan minta kode baru.' };
      }

      // Check Expiration
      if (new Date(record.expiresAt).getTime() < now) {
        record.used = true;
        return { success: false, error: 'OTP_EXPIRED', message: 'Kode OTP telah kedaluwarsa. Silakan minta kode baru.' };
      }

      // Check Max Attempts
      if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
        record.used = true;
        return { success: false, error: 'MAX_ATTEMPTS_EXCEEDED', message: 'Batas percobaan verifikasi terlampaui. Silakan minta kode OTP baru.' };
      }

      // Increment attempt count
      record.attempts += 1;

      // Secure timing-safe hash comparison
      const computedHash = hashOtp(cleanPhone, cleanOtp);
      const hashBuffer = Buffer.from(computedHash, 'hex');
      const recordBuffer = Buffer.from(record.otpHash, 'hex');

      let isValid = false;
      if (hashBuffer.length === recordBuffer.length) {
        isValid = crypto.timingSafeEqual(hashBuffer, recordBuffer);
      }

      if (!isValid) {
        const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
        return {
          success: false,
          error: 'INVALID_OTP',
          message: `Kode OTP salah. Sisa kesempatan: ${remaining} kali.`,
          remainingAttempts: remaining,
        };
      }

      // Mark OTP as successfully used
      record.used = true;

      // Upsert User
      if (!db.users) db.users = [];
      let user = db.users.find((u) => u.phone === cleanPhone);
      const timestamp = new Date(now).toISOString();

      if (user) {
        user.isVerified = true;
        user.lastLoginAt = timestamp;
      } else {
        user = {
          id: `usr_wa_${Date.now().toString(36)}`,
          email: `${cleanPhone}@whatsapp.user`,
          name: `User WhatsApp (${cleanPhone.slice(-4)})`,
          phone: cleanPhone,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          bio: 'Pengguna Terverifikasi WhatsApp Florance',
          provider: 'whatsapp',
          isVerified: true,
          registeredAt: timestamp,
          lastLoginAt: timestamp,
          role: 'user',
        };
        db.users.push(user);
      }

      // Create Session
      const sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
      const sessionExpiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
      const sessionRecord = {
        id: sessionId,
        userId: user.id,
        expiresAt: sessionExpiresAt,
        createdAt: timestamp,
      };

      if (!db.sessions) db.sessions = [];
      db.sessions.push(sessionRecord);

      return {
        success: true,
        user,
        sessionId,
      };
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.error,
          message: verificationResult.message,
          remainingAttempts: (verificationResult as any).remainingAttempts,
        },
        { status: 400 }
      );
    }

    const cookieHeader = `florance_session=${verificationResult.sessionId}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    const res = NextResponse.json({
      success: true,
      message: 'Verifikasi OTP berhasil!',
      user: verificationResult.user,
      token: verificationResult.sessionId,
    });

    res.headers.set('Set-Cookie', cookieHeader);
    return res;
  } catch (err: any) {
    console.error('Error in POST /api/auth/verify-otp:', err);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR', message: 'Terjadi kesalahan saat memverifikasi OTP.' },
      { status: 500 }
    );
  }
}
