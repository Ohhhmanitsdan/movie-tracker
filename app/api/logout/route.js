import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, clearSessionCookie, SESSION_COOKIE } from '@/lib/auth.js';

export const runtime = 'nodejs';

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    deleteSession(token);
  }
  clearSessionCookie();
  return NextResponse.json({ success: true });
}
