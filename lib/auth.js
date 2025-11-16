import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import db from './db.js';

const SESSION_TTL_DAYS = 14;
export const SESSION_COOKIE = 'watchbuddy_session';

export function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export function findUserByEmail(email) {
  if (!email) return null;
  const row = db
    .prepare('SELECT id, name, email, password_hash as passwordHash FROM users WHERE LOWER(email) = LOWER(?)')
    .get(email);
  return row || null;
}

export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function getUserById(id) {
  if (!id) return null;
  const row = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id);
  return row || null;
}

export function createSession(userId) {
  if (!userId) throw new Error('Cannot create session without user');
  cleanupExpiredSessions();
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt.toISOString());
  return { token, expiresAt };
}

export function deleteSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function getUserFromCookies() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
}

export function getUserBySessionToken(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, s.expires_at as expiresAt
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token);

  if (!row) return null;
  const expired = new Date(row.expiresAt).getTime() < Date.now();
  if (expired) {
    deleteSession(token);
    return null;
  }
  return sanitizeUser(row);
}

export function requireUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
}

export function cleanupExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
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
