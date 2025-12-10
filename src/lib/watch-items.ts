import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./db";
import type {
  MediaType,
  TMDBDetails,
  WatchItem,
  WatchStatus,
} from "./types";

type WatchItemDoc = {
  _id: ObjectId;
  tmdbId: string;
  type: MediaType;
  title: string;
  posterUrl: string | null;
  overview: string | null;
  trailerUrl: string | null;
  year: number | null;
  genres: string[];
  status: WatchStatus;
  ratingSkulls: number | null;
  notes: string | null;
  orderIndex: number;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const collectionName = "watchItems";

async function watchItemsCollection(): Promise<Collection<WatchItemDoc>> {
  const db = await getDb();
  return db.collection<WatchItemDoc>(collectionName);
}

export function serializeWatchItem(doc: WatchItemDoc): WatchItem {
  return {
    id: doc._id.toString(),
    tmdbId: doc.tmdbId,
    type: doc.type,
    title: doc.title,
    posterUrl: doc.posterUrl,
    overview: doc.overview,
    trailerUrl: doc.trailerUrl,
    year: doc.year,
    genres: doc.genres,
    status: doc.status,
    ratingSkulls: doc.ratingSkulls,
    notes: doc.notes,
    orderIndex: doc.orderIndex,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getWatchItems(): Promise<WatchItem[]> {
  const col = await watchItemsCollection();
  const items = await col.find({}).sort({ orderIndex: 1 }).toArray();
  return items.map(serializeWatchItem);
}

export type CreateWatchItemInput = TMDBDetails & {
  notes?: string | null;
};

export async function createWatchItem(
  item: CreateWatchItemInput,
  createdBy: string | null,
): Promise<WatchItem> {
  const col = await watchItemsCollection();
  const highestOrder = await col
    .find({})
    .sort({ orderIndex: -1 })
    .limit(1)
    .next();
  const orderIndex = (highestOrder?.orderIndex ?? -10) + 10;

  const now = new Date();
  const doc: Omit<WatchItemDoc, "_id"> = {
    tmdbId: item.tmdbId,
    type: item.type,
    title: item.title,
    posterUrl: item.posterUrl ?? null,
    overview: item.overview ?? null,
    trailerUrl: item.trailerUrl ?? null,
    year: item.year ?? null,
    genres: item.genres ?? [],
    status: "want_to_watch",
    ratingSkulls: null,
    notes: item.notes ?? null,
    orderIndex,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return serializeWatchItem({ ...doc, _id: result.insertedId });
}

export type UpdateWatchItemInput = Partial<
  Pick<WatchItemDoc, "status" | "ratingSkulls" | "notes" | "title" | "trailerUrl">
>;

export async function updateWatchItem(id: string, updates: UpdateWatchItemInput) {
  const col = await watchItemsCollection();
  const objectId = new ObjectId(id);
  const updatePayload = {
    ...updates,
    updatedAt: new Date(),
  };
  await col.updateOne({ _id: objectId }, { $set: updatePayload });
  const updated = await col.findOne({ _id: objectId });
  return updated ? serializeWatchItem(updated) : null;
}

export async function reorderWatchItems(ids: string[]) {
  const col = await watchItemsCollection();
  const operations = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { orderIndex: index * 10, updatedAt: new Date() } },
    },
  }));
  if (operations.length) {
    await col.bulkWrite(operations);
  }
  const reordered = await col.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray();
  const sorted = reordered.sort((a, b) => a.orderIndex - b.orderIndex);
  return sorted.map(serializeWatchItem);
}
