import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth.js';
import { getTopRatedTmdbSeeds, getTrackedTmdbIds } from '@/lib/movies.js';
import { fetchRecommendations } from '@/lib/tmdb.js';

const MAX_RECOMMENDATIONS = 8;

export const runtime = 'nodejs';

export async function GET() {
  const user = requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const seeds = getTopRatedTmdbSeeds(4);
    if (!seeds.length) {
      return NextResponse.json({ recommendations: [] });
    }
    const existing = new Set(getTrackedTmdbIds());
    const seen = new Set();
    const recommendations = [];

    for (const tmdbId of seeds) {
      const items = await fetchRecommendations(tmdbId, 12);
      for (const item of items) {
        if (!item.posterUrl) continue;
        if (existing.has(item.tmdbId) || seen.has(item.tmdbId)) continue;
        recommendations.push(item);
        seen.add(item.tmdbId);
        if (recommendations.length >= MAX_RECOMMENDATIONS) break;
      }
      if (recommendations.length >= MAX_RECOMMENDATIONS) {
        break;
      }
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json({ error: 'Unable to fetch recommendations' }, { status: 502 });
  }
}
