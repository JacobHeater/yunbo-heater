import { v4 as uuidv4 } from 'uuid';

// Centralized session store and secret management. This module is a proper
// singleton: importing it from other modules guarantees the same instances
// in the same Node process without using globalThis.

let SESSION_SECRET = process.env.SESSION_SECRET || '';
if (!SESSION_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production for secure sessions');
  }
  SESSION_SECRET = uuidv4();
  console.warn('No SESSION_SECRET provided; using an ephemeral in-memory secret (dev only). Tokens will not survive process restarts.');
}

export function getSessionSecret() {
  return SESSION_SECRET;
}

export const inMemorySessions = new Map<string, { email: string; role: string; expires: number; jti?: string }>();
export const revokedUsers = new Map<string, number>(); // email -> revokedBefore (unix seconds)
export const revokedJtis = new Map<string, number>(); // jti -> expiry (unix seconds)

export function pruneExpiredJtis(map = revokedJtis) {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of map.entries()) {
    if (exp <= now) map.delete(jti);
  }
}
