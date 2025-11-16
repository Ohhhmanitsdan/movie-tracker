import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth.js';
import { getMoviesForUser, insertMovie } from '@/lib/movies.js';
import { fetchMovieByTitle } from '@/lib/tmdb.js';

export const runtime = 'nodejs';

const addMovieSchema = z.object({
  title: z.string().min(1, 'Movie title is required.')
});

export async function GET() {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const movies = getMoviesForUser(user.id);
  return NextResponse.json({ movies });
}

export async function POST(request) {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = addMovieSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Movie title is required.' }, { status: 400 });
    }

    const movieData = await fetchMovieByTitle(parsed.data.title);
    if (!movieData) {
      return NextResponse.json({ error: 'No matching movie was found.' }, { status: 404 });
    }

    const movie = insertMovie(movieData, user.id);
    return NextResponse.json({ movie });
  } catch (error) {
    if (error.code === 'MOVIE_EXISTS') {
      return NextResponse.json({ error: 'That movie is already on your shared list.' }, { status: 409 });
    }
    console.error('Add movie error:', error);
    return NextResponse.json({ error: 'Unable to add that movie right now.' }, { status: 500 });
  }
}
