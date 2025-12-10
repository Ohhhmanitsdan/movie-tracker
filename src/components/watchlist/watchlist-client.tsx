"use client";

import { useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { SignOutButton } from "../auth-buttons";
import { AddItemModal } from "./add-item-modal";
import { ItemCard } from "./item-card";
import { RandomModal } from "./random-modal";
import type { MediaType, WatchItem, WatchStatus } from "@/lib/types";

type RatingFilter = "all" | "unrated" | 1 | 2 | 3 | 4 | 5;
type SortOption = "custom" | "title" | "rating" | "newest";

type Filters = {
  type: "all" | MediaType;
  status: "all" | WatchStatus;
  genre: "all" | string;
  rating: RatingFilter;
  sort: SortOption;
};

const defaultFilters: Filters = {
  type: "all",
  status: "all",
  genre: "all",
  rating: "all",
  sort: "custom",
};

type Props = {
  initialItems: WatchItem[];
  userEmail: string;
};

export default function WatchlistClient({ initialItems, userEmail }: Props) {
  const [items, setItems] = useState<WatchItem[]>(initialItems);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showAddModal, setShowAddModal] = useState(false);
  const [randomItem, setRandomItem] = useState<WatchItem | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const dragLocked =
    filters.sort !== "custom" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.genre !== "all" ||
    filters.rating !== "all";

  const filtered = useMemo(() => {
    let list = [...items];

    if (filters.type !== "all") {
      list = list.filter((item) => item.type === filters.type);
    }
    if (filters.status !== "all") {
      list = list.filter((item) => item.status === filters.status);
    }
    if (filters.genre !== "all") {
      list = list.filter((item) => item.genres.includes(filters.genre));
    }
    if (filters.rating !== "all") {
      if (filters.rating === "unrated") {
        list = list.filter((item) => item.ratingSkulls === null);
      } else {
        list = list.filter((item) => item.ratingSkulls === filters.rating);
      }
    }

    switch (filters.sort) {
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "rating":
        list.sort(
          (a, b) => (b.ratingSkulls ?? 0) - (a.ratingSkulls ?? 0),
        );
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      default:
        list.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return list;
  }, [items, filters]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [items]);

  const updateItemLocally = (id: string, updates: Partial<WatchItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const persistUpdate = async (id: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/watch-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error("Update failed");
    }
  };

  const handleStatusChange = async (id: string, status: WatchStatus) => {
    const previous = items.find((i) => i.id === id)?.status;
    updateItemLocally(id, { status });
    try {
      await persistUpdate(id, { status });
    } catch (error) {
      console.error(error);
      if (previous) updateItemLocally(id, { status: previous });
      setBanner("Could not update status. Please try again.");
    }
  };

  const handleRatingChange = async (id: string, rating: number | null) => {
    const previous = items.find((i) => i.id === id)?.ratingSkulls ?? null;
    updateItemLocally(id, { ratingSkulls: rating });
    try {
      await persistUpdate(id, { ratingSkulls: rating });
    } catch (error) {
      console.error(error);
      updateItemLocally(id, { ratingSkulls: previous });
      setBanner("Could not save rating. Please try again.");
    }
  };

  const handleNotesChange = async (id: string, notes: string) => {
    updateItemLocally(id, { notes });
    try {
      await persistUpdate(id, { notes });
    } catch (error) {
      console.error(error);
      setBanner("Could not save notes right now.");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || dragLocked) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const reordered = Array.from(filtered);
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, moved);

    // Map back to full items ordering (custom sort only)
    const reorderedIds = reordered.map((item) => item.id);
    setSavingOrder(true);
    setItems((prev) => {
      const map = new Map(prev.map((item) => [item.id, item]));
      const updated = reorderedIds.map((id, idx) => {
        const item = map.get(id);
        return item ? { ...item, orderIndex: idx * 10 } : null;
      }).filter(Boolean) as WatchItem[];
      const remaining = prev.filter((item) => !reorderedIds.includes(item.id));
      return updated.concat(remaining);
    });

    try {
      const res = await fetch("/api/watch-items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reorderedIds }),
      });
      if (!res.ok) {
        throw new Error("Reorder failed");
      }
    } catch (error) {
      console.error(error);
      setBanner("Reordering did not save. Refresh to retry.");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRandomPick = () => {
    if (filtered.length === 0) {
      setBanner("No items match your filters to pick from.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    setRandomItem(filtered[randomIndex]);
  };

  const handleAdded = (item: WatchItem) => {
    setItems((prev) => [...prev, item]);
    setFilters((prev) => ({ ...prev, sort: "custom" }));
    setBanner(null);
  };

  const headerTitle =
    items.length === 0
      ? "Start your shared watchlist"
      : `Shared watchlist · ${items.length} title${items.length === 1 ? "" : "s"}`;

  return (
    <>
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/80 px-5 py-4 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Watchlist for Two
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{headerTitle}</h1>
            <p className="text-sm text-slate-500">Signed in as {userEmail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              + Add title
            </button>
            <button
              type="button"
              onClick={handleRandomPick}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700"
            >
              🎲 Pick something for us
            </button>
            <SignOutButton />
          </div>
        </header>

        <section className="rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <FilterPill
              label="Type"
              value={filters.type}
              options={[
                { label: "All", value: "all" },
                { label: "Movies", value: "movie" },
                { label: "TV", value: "tv" },
              ]}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value as Filters["type"] }))
              }
            />
            <FilterPill
              label="Status"
              value={filters.status}
              options={[
                { label: "All", value: "all" },
                { label: "Want to watch", value: "want_to_watch" },
                { label: "Watching", value: "watching" },
                { label: "Watched", value: "watched" },
              ]}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value as Filters["status"],
                }))
              }
            />
            <FilterPill
              label="Rating"
              value={filters.rating}
              options={[
                { label: "Any", value: "all" },
                { label: "Unrated", value: "unrated" },
                { label: "1 skull", value: 1 },
                { label: "2 skulls", value: 2 },
                { label: "3 skulls", value: 3 },
                { label: "4 skulls", value: 4 },
                { label: "5 skulls", value: 5 },
              ]}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  rating: value as Filters["rating"],
                }))
              }
            />
            <FilterPill
              label="Genre"
              value={filters.genre}
              options={[{ label: "All", value: "all" }].concat(
                genres.map((genre) => ({ label: genre, value: genre })),
              )}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, genre: value as Filters["genre"] }))
              }
            />
            <FilterPill
              label="Sort"
              value={filters.sort}
              options={[
                { label: "Custom order", value: "custom" },
                { label: "Title A–Z", value: "title" },
                { label: "Rating high–low", value: "rating" },
                { label: "Newest added", value: "newest" },
              ]}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, sort: value as Filters["sort"] }))
              }
            />
          </div>
        </section>

        {banner && (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            {banner}
          </div>
        )}

        <section className="space-y-4">
          {dragLocked && items.length > 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
              Drag-and-drop reordering is available when using the custom order with no filters.
              Clear filters to reorder the full list.
            </div>
          )}
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-800">
                Nothing in your watchlist yet.
              </p>
              <p className="text-sm text-slate-500">
                Search OMDB, auto-fill the details, and start planning your next watch.
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  + Add your first title
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-600">
              No items match these filters. Try clearing them to see everything.
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="watchlist">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className="grid gap-4"
                  >
                    {filtered.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                        isDragDisabled={dragLocked}
                      >
                        {(provided) => (
                          <ItemCard
                            item={item}
                            provided={provided}
                            onStatusChange={(status) => handleStatusChange(item.id, status)}
                            onRatingChange={(rating) =>
                              handleRatingChange(item.id, rating)
                            }
                            onNotesChange={(notes) => handleNotesChange(item.id, notes)}
                          />
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </section>
        {savingOrder && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
            Saving order...
          </div>
        )}
      </div>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleAdded}
      />
      <RandomModal item={randomItem} onClose={() => setRandomItem(null)} />
    </>
  );
}

type FilterPillProps = {
  label: string;
  value: string | number;
  options: Array<{ label: string; value: string | number }>;
  onChange: (value: string | number) => void;
};

function FilterPill({ label, value, options, onChange }: FilterPillProps) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
      <span className="text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-slate-900 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
