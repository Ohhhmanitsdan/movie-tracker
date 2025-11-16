import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth.js';

export const runtime = 'nodejs';

export async function GET() {
  const user = getUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
