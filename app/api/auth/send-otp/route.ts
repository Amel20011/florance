import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendWhatsAppOtp, normalizePhoneNumber } from '@/src/lib/whatsapp.js';
import fs from 'node:fs';
import path from 'node:path';

const HASH_SECRET = process.env.OTP_HASH_SECRET || 'florance-secure-otp-hmac-key-2026';
const OTP_EXPIRY_MINUTES = 5;
const RATE_LIMIT_SECONDS = 60;

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
}

// Transactional Helper for JSON DB
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

  const result = operation(db);

  // Atomic save with temp file rename
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

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_PHONE', message: 'Nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhoneNumber(rawPhone);
    const phoneRegex = /^628[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PHONE_FORMAT', message: 'Format nomor WhatsApp Indonesia tidak valid (contoh: 08123456789).' },
        { status: 400 }
      );
    }

    // 1. Enforce Rate Limiting & Transactional State Check
    const now = Date.now();
    const rateLimitCheck = withDbTransaction((db) => {
      const recent = db.whatsapp_otps?.find(
        (rec) => rec.phone === cleanPhone && !rec.used && now - new Date(rec.createdAt).getTime() < RATE_LIMIT_SECONDS * 1000
      );
      if (recent) {
        const remaining = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - new Date(recent.createdAt).getTime())) / 1000);
        return { limited: true, remaining };
      }
      return { limited: false, remaining: 0 };
    });

    if (rateLimitCheck.limited) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Mohon tunggu ${rateLimitCheck.remaining} detik sebelum meminta kode OTP kembali.`,
          remainingSeconds: rateLimitCheck.remaining,
        },
        { status: 429 }
      );
    }

    // 2. Generate secure 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(cleanPhone, otpPlain);
    const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // 3. Save OTP record transactionally
    withDbTransaction((db) => {
      // Invalidate prior unused OTPs for this phone
      db.whatsapp_otps?.forEach((rec) => {
        if (rec.phone === cleanPhone && !rec.used) {
          rec.used = true;
        }
      });

      const newRecord: OtpRecord = {
        id: `wa_otp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        phone: cleanPhone,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
        createdAt: new Date(now).toISOString(),
      };

      db.whatsapp_otps?.unshift(newRecord);
    });

    // 4. Send via FlowKirim WhatsApp Service
    const waResult = await sendWhatsAppOtp({
      phone: cleanPhone,
      otpCode: otpPlain,
      appName: 'FLORANCE',
    });

    console.log(`[API Send OTP] Phone: ${cleanPhone} | Status: ${waResult.success ? 'SUCCESS' : 'FAILED'}`);

    if (!waResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'WHATSAPP_DISPATCH_FAILED',
          message: waResult.error || 'Gagal mengirim pesan WhatsApp melalui gateway FlowKirim.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode OTP 6 digit telah dikirim ke nomor WhatsApp Anda.',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/send-otp:', err);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR', message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
