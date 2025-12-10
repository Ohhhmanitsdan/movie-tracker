import type { MediaDetails, MediaType, SearchResult } from "./types";

const apiKey = process.env.OMDB_API_KEY;

if (!apiKey) {
  throw new Error("Missing OMDB_API_KEY. Add it to your environment.");
}

const OMDB_BASE = "https://www.omdbapi.com/";

const mapType = (type: string | undefined): MediaType =>
  type === "series" ? "tv" : "movie";

const toYear = (year?: string | null) => {
  if (!year) return null;
  const parsed = Number.parseInt(year.slice(0, 4), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

async function omdbFetch(params: Record<string, string>) {
  const url = new URL(OMDB_BASE);
  url.searchParams.set("apikey", apiKey);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OMDB request failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error ?? "OMDB error");
  }
  return data as Record<string, unknown>;
}

export async function searchOMDB(
  query: string,
  type: MediaType | "multi" = "multi",
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const params: Record<string, string> = { s: query };
  if (type !== "multi") {
    params.type = type === "movie" ? "movie" : "series";
  }

  const data = await omdbFetch(params);
  const results = (data.Search as Array<Record<string, string>> | undefined) ?? [];

  return results.map((item) => ({
    imdbId: item.imdbID,
    type: mapType(item.Type),
    title: item.Title,
    overview: null,
    year: toYear(item.Year),
    posterUrl: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
  }));
}

export async function getOmdbDetails(
  imdbId: string,
  type: MediaType,
): Promise<MediaDetails> {
  const data = await omdbFetch({
    i: imdbId,
    plot: "short",
    type: type === "movie" ? "movie" : "series",
  });

  const resolvedType = mapType(data.Type as string | undefined);

  const genresRaw = (data.Genre as string | undefined) ?? "";
  const genres = genresRaw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  return {
    imdbId,
    type: resolvedType,
    title: (data.Title as string) ?? "Untitled",
    overview: (data.Plot as string) && data.Plot !== "N/A" ? (data.Plot as string) : null,
    year: toYear(data.Year as string | undefined),
    posterUrl:
      data.Poster && (data.Poster as string) !== "N/A"
        ? (data.Poster as string)
        : null,
    genres,
    trailerUrl: null,
  };
}
