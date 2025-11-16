import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { readDb, mutateDb } from './db.js';

const SESSION_TTL_DAYS = 14;
export const SESSION_COOKIE = 'watchbuddy_session';

export function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const { users } = readDb();
  return users.find((user) => user.email.toLowerCase() === normalized) || null;
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function getUserById(id) {
  if (!id) return null;
  const { users } = readDb();
  return users.find((user) => user.id === id) || null;
}

export function createSession(userId) {
  if (!userId) throw new Error('Cannot create session without user');
  cleanupExpiredSessions();
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  mutateDb((draft) => {
    draft.sessions.push({
      token,
      userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    });
  });
  return { token, expiresAt };
}

export function deleteSession(token) {
  if (!token) return;
  mutateDb((draft) => {
    draft.sessions = draft.sessions.filter((session) => session.token !== token);
  });
}

export function getUserFromCookies() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
}

export function getUserBySessionToken(token) {
  if (!token) return null;
  const snapshot = readDb();
  const session = snapshot.sessions.find((entry) => entry.token === token);
  if (!session) return null;
  const expired = new Date(session.expiresAt).getTime() < Date.now();
  if (expired) {
    deleteSession(token);
    return null;
  }
  const user = snapshot.users.find((entry) => entry.id === session.userId);
  return sanitizeUser(user);
}

export function requireUser() {
  return getUserFromCookies();
}

export function cleanupExpiredSessions() {
  const now = Date.now();
  mutateDb((draft) => {
    draft.sessions = draft.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
  });
}

export function setSessionCookie(token, expiresAt) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
