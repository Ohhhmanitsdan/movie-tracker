"use client";

import { useState } from "react";
import type { MediaType, WatchItem } from "@/lib/types";

type Props = {
  watchlistId: string;
  onAdded: (item: WatchItem) => void;
};

type SearchResult = {
  imdbId: string;
  type: MediaType;
  title: string;
  overview: string | null;
  year: number | null;
  posterUrl: string | null;
};

export function AddItemPanel({ watchlistId, onAdded }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/omdb/search?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = (await res.json()) as SearchResult[];
      setResults(data);
    } else {
      setError("Search failed. Try again.");
    }
    setLoading(false);
  };

  const addItem = async (imdbId: string, type: MediaType) => {
    setAddingId(imdbId);
    setError(null);
    const detailsRes = await fetch(
      `/api/omdb/details?imdbId=${encodeURIComponent(imdbId)}&type=${type}`,
    );
    if (!detailsRes.ok) {
      setError("Could not fetch details.");
      setAddingId(null);
      return;
    }
    const details = await detailsRes.json();

    const payload = {
      title: details.title,
      type: details.type,
      year: details.year ?? null,
      poster: details.posterUrl ?? null,
      genre: (details.genres as string[]) ?? [],
      synopsis: details.overview ?? null,
      omdbId: imdbId,
      runtime: null,
      starRating: null,
    };

    const res = await fetch(`/api/watchlists/${watchlistId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      onAdded(data.item);
    } else {
      setError("Could not add item.");
    }
    setAddingId(null);
  };

  return (
    <div className="space-y-3 card">
      <form onSubmit={search} className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="modern flex-1"
          placeholder="Search by title or IMDB id..."
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Searching..." : "Search OMDb"}
        </button>
      </form>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <div className="grid gap-3">
        {results.slice(0, 6).map((result) => (
          <div
            key={result.imdbId}
            className="flex items-center justify-between rounded-2xl border border-[var(--elevated)] bg-[var(--surface)] px-3 py-2 shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{result.title}</p>
              <p className="text-xs text-[var(--text2)]">
                {result.type === "movie" ? "Movie" : "Series"}
                {result.year ? ` · ${result.year}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => addItem(result.imdbId, result.type)}
              disabled={addingId === result.imdbId}
              className="btn btn-ghost px-3 py-1.5 text-xs"
            >
              {addingId === result.imdbId ? "Adding..." : "Add"}
            </button>
          </div>
        ))}
        {results.length === 0 && !loading && (
          <p className="text-sm text-[var(--text2)]">
            Try searching for a movie or series to auto-fill details from OMDb.
          </p>
        )}
      </div>
    </div>
  );
}
