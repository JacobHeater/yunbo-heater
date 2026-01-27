import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<string, { email: string; role: string; expires: number }>();

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);

  if (!session || session.expires < Date.now()) {
    // Clean up expired session
    if (session) {
      sessions.delete(sessionId);
    }
    return null;
  }

  return session;
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/teacher/login', request.url));
  }

  return null; // Authenticated
}

export function createSession(email: string, role: string) {
  const sessionId = uuidv4();
  const sessionData = {
    email,
    role,
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  sessions.set(sessionId, sessionData);
  return sessionId;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (sessionId) {
    sessions.delete(sessionId);
  }
}