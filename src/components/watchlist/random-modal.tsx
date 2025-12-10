"use client";

import type { WatchItem } from "@/lib/types";
import Image from "next/image";

type Props = {
  item: WatchItem | null;
  onClose: () => void;
};

export function RandomModal({ item, onClose }: Props) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="relative grid gap-4 p-6 sm:grid-cols-[140px_1fr] sm:gap-6">
          <div className="flex items-center justify-center">
            {item.posterUrl ? (
              <Image
                src={item.posterUrl}
                alt={item.title}
                width={160}
                height={240}
                className="h-48 w-32 rounded-lg object-cover shadow-md sm:h-56 sm:w-40"
              />
            ) : (
              <div className="flex h-48 w-32 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:h-56 sm:w-40">
                No poster
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Random pick
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">
                  {item.type === "movie" ? "Movie" : "TV Show"}
                  {item.year ? ` · ${item.year}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close random picker"
              >
                ✕
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-700 line-clamp-4">
              {item.overview ?? "No synopsis available for this title yet."}
            </p>
            {item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {item.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  Watch trailer
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
