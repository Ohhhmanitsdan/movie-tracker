import { MediaType, TMDBDetails, TMDBSearchResult } from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  throw new Error("Missing TMDB_API_KEY. Add it to your environment.");
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const toYear = (date?: string | null) =>
  date && date.length >= 4 ? Number.parseInt(date.slice(0, 4), 10) : null;

const buildPosterUrl = (posterPath?: string | null) =>
  posterPath ? `${POSTER_BASE}${posterPath}` : null;

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function searchTMDB(
  query: string,
  type: MediaType | "multi" = "multi",
): Promise<TMDBSearchResult[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<{
    results: Array<{
      id: number;
      title?: string;
      name?: string;
      media_type?: MediaType;
      poster_path?: string | null;
      overview?: string | null;
      release_date?: string | null;
      first_air_date?: string | null;
    }>;
  }>(`/search/${type}`, { query });

  return data.results
    .filter((item) => (type === "multi" ? item.media_type !== undefined : true))
    .map((item) => ({
      tmdbId: String(item.id),
      type: (type === "multi" ? item.media_type : type) as MediaType,
      title: item.title ?? item.name ?? "Untitled",
      overview: item.overview ?? null,
      year: toYear(item.release_date ?? item.first_air_date),
      posterUrl: buildPosterUrl(item.poster_path),
    }));
}

export async function getDetails(
  tmdbId: string,
  type: MediaType,
): Promise<TMDBDetails> {
  const data = await tmdbFetch<{
    id: number;
    title?: string;
    name?: string;
    overview?: string | null;
    poster_path?: string | null;
    release_date?: string | null;
    first_air_date?: string | null;
    genres?: Array<{ id: number; name: string }>;
    videos?: { results: Array<{ site: string; type: string; key: string }> };
  }>(`/${type}/${tmdbId}`, { append_to_response: "videos" });

  const trailer =
    data.videos?.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) ??
    data.videos?.results.find(
      (video) => video.site === "YouTube" && video.type === "Teaser",
    );

  return {
    tmdbId,
    type,
    title: data.title ?? data.name ?? "Untitled",
    overview: data.overview ?? null,
    year: toYear(data.release_date ?? data.first_air_date),
    posterUrl: buildPosterUrl(data.poster_path),
    genres: data.genres?.map((g) => g.name) ?? [],
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
  };
}
