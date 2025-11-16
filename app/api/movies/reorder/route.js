import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth.js';
import { reorderMovies } from '@/lib/movies.js';

export const runtime = 'nodejs';

const reorderSchema = z.object({
  orderedIds: z.array(z.number().int()).min(1)
});

export async function PATCH(request) {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const payload = await request.json();
    const parsed = reorderSchema.safeParse({
      orderedIds: (payload.orderedIds || []).map((id) => Number(id)).filter((id) => !Number.isNaN(id))
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Provide an ordered list of ids.' }, { status: 400 });
    }
    reorderMovies(parsed.data.orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Unable to reorder movies' }, { status: 500 });
  }
}
