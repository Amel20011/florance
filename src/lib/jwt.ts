import crypto from 'node:crypto';

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  provider: 'google' | 'apple' | 'email';
  iat: number; // issued at (seconds)
  exp: number; // expires at (seconds)
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'florance_jwt_secret_production_key_2026_qris_auth_pipeline';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Generate cryptographically signed JWT Token (HMAC SHA-256)
 */
export function signJWT(
  payloadData: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresInSeconds: number = 7 * 24 * 3600
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    ...payloadData,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export function verifyJWT(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token tidak disediakan.' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Format JWT token tidak valid.' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { valid: false, error: 'Tanda tangan kriptografi JWT tidak cocok.' };
  }

  try {
    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Sesi JWT telah kedaluwarsa. Silakan login kembali.' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Payload JWT tidak dapat didekode.' };
  }
}
