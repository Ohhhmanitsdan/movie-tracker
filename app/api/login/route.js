import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  findUserByEmail,
  verifyPassword,
  createSession,
  sanitizeUser,
  setSessionCookie
} from '@/lib/auth.js';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const { token, expiresAt } = createSession(user.id);
    setSessionCookie(token, expiresAt);

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
