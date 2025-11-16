import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { getRandomPendingMovie } from '@/lib/movies.js';

export const runtime = 'nodejs';

export async function GET() {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const movie = getRandomPendingMovie(user.id);
  if (!movie) {
    return NextResponse.json({ error: 'No unwatched movies left!' }, { status: 404 });
  }
  return NextResponse.json({ movie });
}
