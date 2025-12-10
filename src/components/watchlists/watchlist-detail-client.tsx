"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddItemPanel } from "./add-item-panel";
import { FilterBar } from "./filter-bar";
import { WatchItemCard } from "./watch-item-card";
import type { WatchItem, WatchlistSummary } from "@/lib/types";

type Props = {
  watchlist: WatchlistSummary;
  initialItems: WatchItem[];
};

type Filters = {
  type: "all" | "movie" | "series";
  genre: "all" | string;
  minRating: "all" | 1 | 2 | 3 | 4 | 5;
};

export function WatchlistDetailClient({ watchlist, initialItems }: Props) {
  const [items, setItems] = useState<WatchItem[]>(initialItems);
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    genre: "all",
    minRating: "all",
  });
  const [saving, setSaving] = useState(false);
  const [randomPick, setRandomPick] = useState<WatchItem | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const genres = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.genre.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filters.type !== "all") list = list.filter((i) => i.type === filters.type);
    if (filters.genre !== "all") list = list.filter((i) => i.genre.includes(filters.genre));
    if (filters.minRating !== "all") {
      const min = Number(filters.minRating);
      list = list.filter((i) => (i.starRating ?? 0) >= min);
    }
    return list;
  }, [items, filters]);

  const handleRatingChange = async (id: string, rating: number | null) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, starRating: rating } : i)));
    const res = await fetch(`/api/watchlists/${watchlist.id}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starRating: rating }),
    });
    if (!res.ok) {
      setBanner("Could not save rating. Please try again.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = filtered.findIndex((i) => i.id === active.id);
    const overIndex = filtered.findIndex((i) => i.id === over.id);
    const newOrder = arrayMove(filtered, activeIndex, overIndex);

    const orderedIds = newOrder.map((i) => i.id);
    setItems((prev) => {
      return newOrder
        .map((item, idx) => ({ ...item, orderIndex: idx * 10 }))
        .concat(prev.filter((i) => !orderedIds.includes(i.id)));
    });

    setSaving(true);
    const res = await fetch(`/api/watchlists/${watchlist.id}/items/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: orderedIds }),
    });
    if (!res.ok) {
      setBanner("Reorder did not save. Refresh to retry.");
    }
    setSaving(false);
  };

  const handleRandomPick = async () => {
    const params = new URLSearchParams();
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.genre !== "all") params.set("genre", filters.genre);
    if (filters.minRating !== "all") params.set("minRating", String(filters.minRating));
    const res = await fetch(`/api/watchlists/${watchlist.id}/random?${params.toString()}`);
    if (!res.ok) {
      setBanner("No items match these filters for a random pick.");
      setRandomPick(null);
      return;
    }
    const data = await res.json();
    setRandomPick(data.item);
  };

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text2)]">Watchlist</p>
            <h1 className="text-3xl font-bold text-[var(--text)]">{watchlist.name}</h1>
            <p className="text-sm text-[var(--text2)]">
              Invite code: <span className="font-mono text-[var(--text)]">{watchlist.inviteCode}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/app/watchlists/${watchlist.id}?code=${watchlist.inviteCode}`)}
            className="btn btn-primary"
          >
            Copy invite link
          </button>
        </div>

      <AddItemPanel
        watchlistId={watchlist.id}
        onAdded={(item) => setItems((prev) => [...prev, item])}
      />

      <FilterBar
        filters={filters}
        genres={genres}
        onChange={setFilters}
        onRandomPick={handleRandomPick}
      />

      {banner && (
        <div className="rounded-2xl bg-[var(--elevated)] px-4 py-3 text-sm text-[var(--text)] ring-1 ring-[var(--primary-glow)]">
          {banner}
        </div>
      )}

      {randomPick && (
        <div className="rounded-2xl border border-[var(--elevated)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)]">
          Random pick: <strong>{randomPick.title}</strong> ({randomPick.type}
          {randomPick.year ? ` · ${randomPick.year}` : ""})
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-3">
            {filtered.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                <WatchItemCard
                  item={item}
                  onRatingChange={(rating) => handleRatingChange(item.id, rating)}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[var(--elevated)] bg-[var(--surface)] p-8 text-center text-[var(--text2)]">
          No items match these filters. Add something new or clear the filters.
        </div>
      )}

      {saving && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] shadow-lg ring-1 ring-[var(--elevated)]">
          Saving order...
        </div>
      )}
    </div>
  );
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? "0 10px 30px rgba(0,0,0,0.35)" : undefined,
    transformOrigin: "center",
    scale: isDragging ? 1.03 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
