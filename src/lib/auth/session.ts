import crypto from 'node:crypto';
import {
  createDbSession,
  getDbSession,
  deleteDbSession,
  getUserById,
  RegisteredUser,
} from '../db.js';

export const SESSION_COOKIE_NAME = 'florance_session';
export const SESSION_MAX_AGE_DAYS = 7;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

/**
 * Creates a new secure session and returns the session ID, token, and formatted Set-Cookie header
 */
export function createSession(userId: string): {
  sessionId: string;
  token: string;
  cookieHeader: string;
} {
  const session = createDbSession(userId, SESSION_MAX_AGE_DAYS);

  // Form secure HTTP-Only cookie
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';
  const expiresDate = new Date(Date.now() + SESSION_MAX_AGE_MS).toUTCString();

  const cookieHeader = `${SESSION_COOKIE_NAME}=${session.id}; Path=/; Expires=${expiresDate}; Max-Age=${SESSION_MAX_AGE_DAYS * 86400}; HttpOnly; SameSite=Lax${secureFlag}`;

  return {
    sessionId: session.id,
    token: session.id,
    cookieHeader,
  };
}

/**
 * Generates clear-cookie header for logging out
 */
export function createLogoutCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`;
}

/**
 * Parses session ID from Cookie header or Authorization Bearer header
 */
export function extractSessionId(cookieHeader?: string, authHeader?: string): string | null {
  // 1. Check Authorization Bearer header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken) return bearerToken;
  }

  // 2. Check Cookie header
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        return decodeURIComponent(cookie.substring(SESSION_COOKIE_NAME.length + 1));
      }
    }
  }

  return null;
}

/**
 * Authenticates the current user session from request headers
 */
export function authenticateSession(
  cookieHeader?: string,
  authHeader?: string
): RegisteredUser | null {
  const sessionId = extractSessionId(cookieHeader, authHeader);
  if (!sessionId) return null;

  const session = getDbSession(sessionId);
  if (!session) return null;

  const user = getUserById(session.userId);
  if (!user) return null;

  return user;
}

/**
 * Invalidates and deletes a session
 */
export function invalidateSession(sessionId: string): void {
  deleteDbSession(sessionId);
}
