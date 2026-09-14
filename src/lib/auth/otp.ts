import crypto from 'node:crypto';
import {
  createEmailOtpRecord,
  getLatestUnusedOtp,
  getRecentOtpForEmail,
  invalidateAllOtpsForEmail,
  updateOtpRecord,
  EmailOtpRecord,
} from '../db.js';

export const OTP_CONFIG = {
  get expiresInMinutes(): number {
    return Math.max(1, parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '5', 10));
  },
  get maxAttempts(): number {
    return Math.max(1, parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10));
  },
  get resendCooldownSeconds(): number {
    return Math.max(10, parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10));
  },
};

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.OTP_SECRET ||
    'florance-secure-otp-whatsapp-secret-salt-2026'
  );
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP string
 */
export function generateSecureOtp(): string {
  const codeInt = crypto.randomInt(100000, 1000000);
  return codeInt.toString().padStart(6, '0');
}

/**
 * Computes a secure HMAC-SHA256 hash of the OTP scoped to the phone number
 */
export function hashOtp(phone: string, otp: string): string {
  const normalizedPhone = phone.trim();
  const secret = getSecretKey();
  return crypto
    .createHmac('sha256', secret)
    .update(`${normalizedPhone}:${otp}`)
    .digest('hex');
}

/**
 * Constant-time comparison of candidate OTP hash against stored OTP hash
 */
export function verifyOtpHash(phone: string, candidateOtp: string, storedHash: string): boolean {
  try {
    const candidateHash = hashOtp(phone, candidateOtp);
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');

    if (candidateBuf.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateBuf, storedBuf);
  } catch {
    return false;
  }
}

export type OtpVerificationResult =
  | { success: true; record: EmailOtpRecord }
  | {
      success: false;
      error:
        | 'INVALID_OTP'
        | 'OTP_EXPIRED'
        | 'OTP_ALREADY_USED'
        | 'OTP_MAX_ATTEMPTS'
        | 'OTP_NOT_FOUND';
      message: string;
      remainingAttempts?: number;
    };

/**
 * Checks if the phone number is currently in resend cooldown
 */
export function checkResendCooldown(phone: string): { allowed: boolean; remainingSeconds: number } {
  const normalizedPhone = phone.trim();
  const cooldownMs = OTP_CONFIG.resendCooldownSeconds * 1000;
  const recent = getRecentOtpForEmail(normalizedPhone, cooldownMs);

  if (!recent) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsedMs = Date.now() - new Date(recent.createdAt).getTime();
  const remainingSeconds = Math.max(0, Math.ceil((cooldownMs - elapsedMs) / 1000));

  return {
    allowed: remainingSeconds <= 0,
    remainingSeconds,
  };
}

/**
 * Prepares a new OTP record: invalidates previous active OTPs and returns the new plain OTP & record
 */
export function issueNewOtp(phone: string): { otpPlain: string; record: EmailOtpRecord } {
  const normalizedPhone = phone.trim();

  // Invalidate any older unused OTPs for this phone
  invalidateAllOtpsForEmail(normalizedPhone);

  // Generate new OTP
  const otpPlain = generateSecureOtp();
  const otpHash = hashOtp(normalizedPhone, otpPlain);

  const expiresAt = new Date(
    Date.now() + OTP_CONFIG.expiresInMinutes * 60 * 1000
  ).toISOString();

  const record = createEmailOtpRecord({
    email: normalizedPhone, // reusing email field in db record for phone
    otpHash,
    expiresAt,
  });

  return { otpPlain, record };
}

/**
 * Verifies the user submitted OTP against database records
 */
export function verifyOtp(phone: string, candidateOtp: string): OtpVerificationResult {
  const normalizedPhone = phone.trim();
  const record = getLatestUnusedOtp(normalizedPhone);

  if (!record) {
    return {
      success: false,
      error: 'OTP_NOT_FOUND',
      message: 'Kode OTP tidak ditemukan atau sudah pernah digunakan. Silakan minta kode baru.',
    };
  }

  // 1. Check if already used
  if (record.used) {
    return {
      success: false,
      error: 'OTP_ALREADY_USED',
      message: 'Kode OTP ini sudah pernah digunakan sebelumnya. Silakan minta kode baru.',
    };
  }

  // 2. Check maximum attempts reached
  if (record.attempts >= OTP_CONFIG.maxAttempts) {
    updateOtpRecord(record.id, { used: true });
    return {
      success: false,
      error: 'OTP_MAX_ATTEMPTS',
      message: 'Batas maksimum percobaan salah telah tercapai (5 kali). Kode dinonaktifkan.',
    };
  }

  // 3. Check expiration
  const now = Date.now();
  const expiryTime = new Date(record.expiresAt).getTime();
  if (now > expiryTime) {
    updateOtpRecord(record.id, { used: true });
    return {
      success: false,
      error: 'OTP_EXPIRED',
      message: 'Kode OTP telah kedaluwarsa (berlaku 5 menit). Silakan minta kode baru.',
    };
  }

  // 4. Compare hash using timing-safe comparison
  const isValid = verifyOtpHash(normalizedPhone, candidateOtp, record.otpHash);

  if (!isValid) {
    const newAttempts = record.attempts + 1;
    const isExhausted = newAttempts >= OTP_CONFIG.maxAttempts;

    updateOtpRecord(record.id, {
      attempts: newAttempts,
      used: isExhausted ? true : record.used,
    });

    const remaining = Math.max(0, OTP_CONFIG.maxAttempts - newAttempts);

    if (isExhausted) {
      return {
        success: false,
        error: 'OTP_MAX_ATTEMPTS',
        message: 'Batas maksimum percobaan salah telah tercapai (5 kali). Silakan minta kode baru.',
        remainingAttempts: 0,
      };
    }

    return {
      success: false,
      error: 'INVALID_OTP',
      message: `Kode OTP yang Anda masukkan salah. Sisa percobaan: ${remaining} kali.`,
      remainingAttempts: remaining,
    };
  }

  // 5. Success! Mark as used
  updateOtpRecord(record.id, {
    used: true,
  });

  return {
    success: true,
    record,
  };
}
