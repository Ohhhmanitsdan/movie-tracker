"use client";

import { useState } from "react";
import type { SearchResult, WatchItem } from "@/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (item: WatchItem) => void;
};

type SearchType = "multi" | "movie" | "tv";

export function AddItemModal({ isOpen, onClose, onAdded }: Props) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("multi");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runSearch = async () => {
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/omdb/search?query=${encodeURIComponent(query)}&type=${searchType}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as SearchResult[];
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Unable to search OMDB right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (result: SearchResult) => {
    setSubmitting(true);
    setError(null);
    try {
      const detailsRes = await fetch(
        `/api/omdb/details?imdbId=${result.imdbId}&type=${result.type}`,
      );
      if (!detailsRes.ok) throw new Error("Failed to fetch details");
      const details = await detailsRes.json();

      const createRes = await fetch("/api/watch-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      if (!createRes.ok) throw new Error("Failed to add item");
      const created = (await createRes.json()) as WatchItem;
      onAdded(created);
      onClose();
      setResults([]);
      setQuery("");
    } catch (err) {
      console.error(err);
      setError("Could not add that title. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 px-4 py-10 backdrop-blur">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Add a title
            </p>
            <h3 className="text-lg font-semibold text-slate-900">Search OMDB</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close add item modal"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-inner">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies or TV shows..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearch();
                  }
                }}
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-indigo-300"
            >
              <option value="multi">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV</option>
            </select>
            <button
              type="button"
              onClick={runSearch}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
              {error}
            </div>
          )}
          <div className="grid max-h-[420px] gap-3 overflow-y-auto">
            {results.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No results yet—try a search.</p>
            ) : (
              results.map((result) => (
                <button
                  key={`${result.imdbId}-${result.type}`}
                  type="button"
                  onClick={() => handleAdd(result)}
                  disabled={submitting}
                  className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg disabled:cursor-not-allowed"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs font-semibold uppercase text-slate-600">
                    {result.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.posterUrl}
                        alt={result.title}
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      result.type === "movie" ? "Movie" : "TV"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {result.title}{" "}
                      <span className="text-slate-500">
                        · {result.type === "movie" ? "Movie" : "TV"}
                        {result.year ? ` · ${result.year}` : ""}
                      </span>
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {result.overview ?? "No synopsis provided."}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Add
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
