import { Schema, model, models, type Model } from "mongoose";

export type WatchItemDocument = {
  _id: string;
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
  createdAt: Date;
};

const WatchItemSchema = new Schema<WatchItemDocument>({
  watchlistId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["movie", "series"], required: true },
  year: { type: Number, required: false },
  poster: { type: String, required: false },
  genre: { type: [String], required: true, default: [] },
  synopsis: { type: String, required: false },
  omdbId: { type: String, required: false },
  runtime: { type: String, required: false },
  addedBy: { type: String, required: true },
  starRating: { type: Number, required: false, min: 1, max: 5, default: null },
  orderIndex: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
});

WatchItemSchema.index({ watchlistId: 1, orderIndex: 1 });

export const WatchItem: Model<WatchItemDocument> =
  models.WatchItem || model<WatchItemDocument>("WatchItem", WatchItemSchema);
