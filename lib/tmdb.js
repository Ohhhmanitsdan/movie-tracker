const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function ensureApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY is missing. Add it to your environment.');
  }
  return key;
}

async function tmdbFetch(path, params = {}) {
  const apiKey = ensureApiKey();
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`TMDb request failed (${res.status}): ${message}`);
  }
  return res.json();
}

function formatPoster(path) {
  return path ? `${TMDB_IMAGE_BASE}${path}` : null;
}

function extractTrailer(videos = []) {
  const trailer = videos.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official
  ) || videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer');
  if (!trailer) return null;
  return `https://www.youtube.com/watch?v=${trailer.key}`;
}

export async function fetchMovieByTitle(title) {
  if (!title) return null;
  const search = await tmdbFetch('/search/movie', { query: title.trim(), include_adult: 'false' });
  if (!search.results?.length) return null;

  const topResult = search.results[0];
  const details = await tmdbFetch(`/movie/${topResult.id}`, { append_to_response: 'videos' });

  return {
    tmdbId: details.id,
    title: details.title,
    overview: details.overview,
    releaseDate: details.release_date,
    posterUrl: formatPoster(details.poster_path || topResult.poster_path),
    trailerUrl: extractTrailer(details.videos?.results || []),
    runtime: details.runtime,
    genres: details.genres?.map((g) => g.name) ?? []
  };
}

export async function fetchRecommendations(tmdbId, limit = 8) {
  if (!tmdbId) return [];
  const data = await tmdbFetch(`/movie/${tmdbId}/recommendations`, { page: 1 });
  const items = data.results ?? [];
  return items.slice(0, limit).map((item) => ({
    tmdbId: item.id,
    title: item.title,
    overview: item.overview,
    releaseDate: item.release_date,
    posterUrl: formatPoster(item.poster_path)
  }));
}
