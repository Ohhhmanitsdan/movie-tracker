"use client";

/* eslint-disable react-hooks/refs */

import { useEffect, useState } from "react";
import type { DraggableProvided } from "@hello-pangea/dnd";
import Image from "next/image";
import clsx from "clsx";
import { SkullRating } from "./rating";
import type { WatchItem, WatchStatus } from "@/lib/types";

type Props = {
  item: WatchItem;
  provided: DraggableProvided;
  onStatusChange: (status: WatchStatus) => void;
  onRatingChange: (rating: number | null) => void;
  onNotesChange: (notes: string) => void;
};

const statusLabels: Record<WatchStatus, string> = {
  want_to_watch: "Want to watch",
  watching: "Watching",
  watched: "Watched",
};

const statusColors: Record<WatchStatus, string> = {
  want_to_watch: "bg-amber-50 text-amber-800 ring-amber-100",
  watching: "bg-blue-50 text-blue-800 ring-blue-100",
  watched: "bg-emerald-50 text-emerald-800 ring-emerald-100",
};

export function ItemCard({
  item,
  provided,
  onStatusChange,
  onRatingChange,
  onNotesChange,
}: Props) {
  const [notes, setNotes] = useState(item.notes ?? "");

  useEffect(() => {
    setNotes(item.notes ?? "");
  }, [item.notes]);

  return (
    <article
      className="group relative grid gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
      ref={provided.innerRef}
      {...provided.draggableProps}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-24 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
          {...provided.dragHandleProps}
        >
          {item.posterUrl ? (
            <Image
              src={item.posterUrl}
              alt={item.title}
              width={120}
              height={180}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-semibold uppercase text-slate-500">
              Drag
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {item.type === "movie" ? "Movie" : "TV"}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500">
                {item.year ? `${item.year} · ` : ""}
                {item.genres.slice(0, 3).join(" / ") || "No genres"}
              </p>
            </div>
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                statusColors[item.status],
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              {statusLabels[item.status]}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-slate-700">
            {item.overview ?? "No synopsis yet. Add notes below to keep context."}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              Status
              <select
                value={item.status}
                onChange={(e) => onStatusChange(e.target.value as WatchStatus)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-indigo-300"
              >
                {Object.keys(statusLabels).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status as WatchStatus]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-1 items-center justify-start gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rating
              </span>
              <SkullRating value={item.ratingSkulls} onChange={onRatingChange} />
            </div>
            {item.trailerUrl && (
              <a
                href={item.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:border-indigo-200"
              >
                ▶ Trailer
              </a>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onNotesChange(notes)}
              placeholder="Add a quick thought or plan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 shadow-inner outline-none transition focus:border-indigo-300 focus:bg-white"
              rows={2}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
