import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth.js';
import { updateMovie, deleteMovie, getMovieById } from '@/lib/movies.js';

export const runtime = 'nodejs';

const updateSchema = z.object({
  completed: z.boolean().optional()
});

export async function PATCH(request, { params }) {
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
    const parsed = updateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }
    if (parsed.data.completed === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }
    const movie = updateMovie(movieId, { completed: parsed.data.completed }, user.id);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Patch movie error:', error);
    return NextResponse.json({ error: 'Unable to update movie' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const movieId = Number(params.id);
  if (!movieId) {
    return NextResponse.json({ error: 'Invalid movie id' }, { status: 400 });
  }
  const movie = getMovieById(movieId, user.id);
  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }
  deleteMovie(movieId);
  return NextResponse.json({ success: true });
}
