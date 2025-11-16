import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth.js';
import { saveRating } from '@/lib/movies.js';

export const runtime = 'nodejs';

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5).nullable().optional()
});

export async function POST(request, { params }) {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const movieId = Number(params.id);
  if (!movieId) {
    return NextResponse.json({ error: 'Invalid movie id' }, { status: 400 });
  }
  try {
    const payload = await request.json();
    const parsed = ratingSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Rating must be a number between 1 and 5.' }, { status: 400 });
    }
    const movie = saveRating(movieId, user.id, parsed.data.rating ?? null);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Save rating error:', error);
    return NextResponse.json({ error: 'Unable to save rating' }, { status: 500 });
  }
}
