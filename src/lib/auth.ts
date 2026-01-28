import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { getSessionSecret, inMemorySessions, revokedUsers, revokedJtis, pruneExpiredJtis } from '@/lib/sessionStore';

const SESSION_SECRET = getSessionSecret();
const JWT_MODE = true; // Always use JWTs (stateless) to avoid fragile in-memory session lookups

// --------- Public API ---------
export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return null;

    if (JWT_MODE) {
      try {
        const verified = jwt.verify(sessionToken, SESSION_SECRET) as unknown;
        if (typeof verified === 'object' && verified !== null) {
          const payload = verified as Record<string, unknown>;
          pruneExpiredJtis();
          const revokedBefore = revokedUsers.get(payload.email as string) || 0;
          if (typeof payload.iat === 'number' && payload.iat <= revokedBefore) return null;
          if (typeof payload.jti === 'string' && revokedJtis.has(payload.jti)) return null;
          return { email: payload.email as string, role: payload.role as string };
        }
        return null;
      } catch {
        return null;
      }
    }

    // in-memory sessions
    const session = inMemorySessions.get(sessionToken as string);
    if (!session || session.expires < Date.now()) {
      if (session) inMemorySessions.delete(sessionToken as string);
      return null;
    }
    return { email: session.email, role: session.role };
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL('/teacher/login', request.url));
  }
  return null;
}

export async function requireApiAuth(request?: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export function createSession(email: string, role: string) {
  const expiresSeconds = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24h

  if (JWT_MODE) {
    const jti = uuidv4();
    const token = jwt.sign({ email, role, jti }, SESSION_SECRET, { algorithm: 'HS256', expiresIn: '24h' });
    return token;
  }

  const sessionId = uuidv4();
  const sessionData = { email, role, expires: Date.now() + 24 * 60 * 60 * 1000 };
  inMemorySessions.set(sessionId, sessionData);
  return sessionId;
}

export function clearUserSessions(email: string) {
  if (JWT_MODE) {
    // Set revoked-before to one second earlier so a newly-created token
    // (issued immediately after clearing) isn't rejected due to equal iat.
    revokedUsers.set(email, Math.floor(Date.now() / 1000) - 1);
    return;
  }

  for (const [sessionId, session] of inMemorySessions.entries()) {
    if (session.email === email) {
      inMemorySessions.delete(sessionId);
    }
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) return;

    if (JWT_MODE) {
      try {
        const verified = jwt.verify(sessionToken, SESSION_SECRET) as unknown;
        if (typeof verified === 'object' && verified !== null) {
          const payload = verified as Record<string, unknown>;
          if (typeof payload.jti === 'string' && typeof payload.exp === 'number') {
            revokedJtis.set(payload.jti, payload.exp);
            pruneExpiredJtis();
          }
        }
      } catch {
        // ignore
      }
      return;
    }

  // in-memory
  if (inMemorySessions.has(sessionToken)) inMemorySessions.delete(sessionToken);
}