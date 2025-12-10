"use client";

import { StarRating } from "../ui/star-rating";
import type { WatchItem } from "@/lib/types";

type Props = {
  item: WatchItem;
  onRatingChange: (rating: number | null) => void;
};

export function WatchItemCard({ item, onRatingChange }: Props) {
  return (
    <div className="card flex items-start gap-4">
      <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.poster} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          item.type.toUpperCase()
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[var(--text)]">{item.title}</p>
            <p className="text-xs text-[var(--text2)]">
              {item.type === "movie" ? "Movie" : "Series"}
              {item.year ? ` · ${item.year}` : ""} {item.genre.length ? `· ${item.genre.join(", ")}` : ""}
            </p>
          </div>
          <StarRating value={item.starRating} onChange={onRatingChange} size="sm" />
        </div>
        {item.synopsis && (
          <p className="text-sm text-[var(--text2)] line-clamp-2">{item.synopsis}</p>
        )}
      </div>
    </div>
  );
}
