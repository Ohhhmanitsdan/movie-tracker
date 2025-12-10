import { Schema, model, models, type Model } from "mongoose";

export type WatchlistDocument = {
  _id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  visibility: "private" | "link";
  inviteCode: string;
  createdAt: Date;
};

const WatchlistSchema = new Schema<WatchlistDocument>({
  name: { type: String, required: true, trim: true },
  ownerId: { type: String, required: true, index: true },
  memberIds: { type: [String], required: true, default: [] },
  visibility: { type: String, enum: ["private", "link"], default: "private" },
  inviteCode: { type: String, required: true, index: true },
  createdAt: { type: Date, default: () => new Date() },
});

WatchlistSchema.index({ inviteCode: 1 }, { unique: true });

export const Watchlist: Model<WatchlistDocument> =
  models.Watchlist || model<WatchlistDocument>("Watchlist", WatchlistSchema);
