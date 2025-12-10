import { connectDb } from "./db";
import { WatchItem, type WatchItemDocument } from "./models/watchitem";
import { Watchlist } from "./models/watchlist";

export type WatchItemDto = {
  id: string;
  watchlistId: string;
  title: string;
  type: "movie" | "series";
  year: number | null;
  poster: string | null;
  genre: string[];
  synopsis: string | null;
  omdbId: string | null;
  runtime: string | null;
  addedBy: string;
  starRating: number | null;
  orderIndex: number;
  createdAt: string;
};

function serialize(item: WatchItemDocument): WatchItemDto {
  return {
    id: item._id.toString(),
    watchlistId: item.watchlistId,
    title: item.title,
    type: item.type,
    year: item.year ?? null,
    poster: item.poster ?? null,
    genre: item.genre ?? [],
    synopsis: item.synopsis ?? null,
    omdbId: item.omdbId ?? null,
    runtime: item.runtime ?? null,
    addedBy: item.addedBy,
    starRating: item.starRating ?? null,
    orderIndex: item.orderIndex,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function listItems(watchlistId: string, userId: string) {
  await connectDb();
  const wl = await Watchlist.findById(watchlistId).lean();
  if (!wl) return null;
  const isMember = wl.ownerId === userId || wl.memberIds.includes(userId);
  if (!isMember) return null;
  const items = await WatchItem.find({ watchlistId }).sort({ orderIndex: 1 }).lean();
  return items.map((i) => serialize(i as WatchItemDocument));
}

export async function addItem(
  watchlistId: string,
  userId: string,
  payload: Omit<WatchItemDto, "id" | "orderIndex" | "createdAt" | "watchlistId" | "addedBy"> & {
    starRating?: number | null;
  },
) {
  await connectDb();
  const wl = await Watchlist.findById(watchlistId).lean();
  if (!wl) return null;
  const isMember = wl.ownerId === userId || wl.memberIds.includes(userId);
  if (!isMember) return null;
  const highest = await WatchItem.find({ watchlistId }).sort({ orderIndex: -1 }).limit(1).lean<WatchItemDocument[]>();
  const orderIndex = (highest[0]?.orderIndex ?? 0) + 10;
  const { starRating = null, ...rest } = payload;
  const item = await WatchItem.create({
    watchlistId,
    addedBy: userId,
    orderIndex,
    starRating,
    ...rest,
  });
  return serialize(item);
}

export async function updateRating(watchlistId: string, itemId: string, userId: string, starRating: number | null) {
  await connectDb();
  const wl = await Watchlist.findById(watchlistId).lean();
  if (!wl) return null;
  const isMember = wl.ownerId === userId || wl.memberIds.includes(userId);
  if (!isMember) return null;
  await WatchItem.updateOne({ _id: itemId, watchlistId }, { $set: { starRating } });
  const updated = await WatchItem.findById(itemId).lean<WatchItemDocument | null>();
  return updated ? serialize(updated) : null;
}

export async function reorderItems(watchlistId: string, userId: string, ids: string[]) {
  await connectDb();
  const wl = await Watchlist.findById(watchlistId).lean();
  if (!wl) return null;
  const isMember = wl.ownerId === userId || wl.memberIds.includes(userId);
  if (!isMember) return null;

  const operations = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id, watchlistId },
      update: { $set: { orderIndex: index * 10 } },
    },
  }));

  if (operations.length) {
    await WatchItem.bulkWrite(operations);
  }

  const reordered = await WatchItem.find({ _id: { $in: ids }, watchlistId })
    .sort({ orderIndex: 1 })
    .lean<WatchItemDocument[]>();
  return reordered.map((r) => serialize(r));
}

export async function randomItem(
  watchlistId: string,
  userId: string,
  filters: { genre?: string; type?: "movie" | "series"; minRating?: number },
) {
  const items = await listItems(watchlistId, userId);
  if (!items) return null;
  let filtered = [...items];
  if (filters.type) filtered = filtered.filter((i) => i.type === filters.type);
  if (filters.genre) filtered = filtered.filter((i) => i.genre.includes(filters.genre!));
  if (filters.minRating) filtered = filtered.filter((i) => (i.starRating ?? 0) >= filters.minRating!);
  if (!filtered.length) return null;
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}
