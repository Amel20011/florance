import crypto from 'node:crypto';

/**
 * Creates an HMAC-SHA256 signature for a raw payload using the provided secret.
 */
export function createHmacSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Verifies that the received signature matches the expected HMAC-SHA256 of the payload.
 * Uses timingSafeEqual to protect against timing attacks.
 */
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret || !payload) {
    return false;
  }

  const expected = createHmacSignature(payload, secret);
  const received = signature.trim().toLowerCase();

  if (expected.length !== received.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(received, 'utf8')
    );
  } catch {
    return false;
  }
}
