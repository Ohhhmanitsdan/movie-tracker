import crypto from "crypto";
import { connectDb } from "./db";
import { Watchlist, type WatchlistDocument } from "./models/watchlist";
import { WatchItem } from "./models/watchitem";

export type WatchlistSummary = {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
  visibility: "private" | "link";
  inviteCode: string;
  createdAt: string;
};

export function serializeWatchlist(doc: WatchlistDocument): WatchlistSummary {
  return {
    id: doc._id.toString(),
    name: doc.name,
    ownerId: doc.ownerId,
    memberCount: doc.memberIds.length + 1,
    visibility: doc.visibility,
    inviteCode: doc.inviteCode,
    createdAt: doc.createdAt.toISOString(),
  };
}

function newInviteCode() {
  return crypto.randomBytes(8).toString("hex");
}

export async function createWatchlist(userId: string, name: string) {
  await connectDb();
  const inviteCode = newInviteCode();
  const watchlist = await Watchlist.create({
    name,
    ownerId: userId,
    memberIds: [],
    visibility: "link",
    inviteCode,
  });
  return serializeWatchlist(watchlist);
}

export async function listWatchlists(userId: string) {
  await connectDb();
  const watchlists = await Watchlist.find({
    $or: [{ ownerId: userId }, { memberIds: userId }],
  }).lean();
  return watchlists.map((w) => serializeWatchlist(w as WatchlistDocument));
}

export async function getWatchlistForUser(watchlistId: string, userId: string) {
  await connectDb();
  const wl = await Watchlist.findById(watchlistId).lean<WatchlistDocument | null>();
  if (!wl) return null;
  const isMember = wl.ownerId === userId || wl.memberIds.includes(userId);
  return isMember ? serializeWatchlist(wl) : null;
}

export async function joinWatchlistByCode(userId: string, code: string) {
  await connectDb();
  const wl = await Watchlist.findOne({ inviteCode: code }).lean<WatchlistDocument | null>();
  if (!wl) return null;
  const isMember = wl.ownerId === userId || wl.memberIds.includes(userId);
  if (isMember) return serializeWatchlist(wl);
  await Watchlist.updateOne({ _id: wl._id }, { $addToSet: { memberIds: userId } });
  const updated = await Watchlist.findById(wl._id).lean<WatchlistDocument | null>();
  return updated ? serializeWatchlist(updated) : null;
}

export async function regenerateInviteCode(watchlistId: string, userId: string) {
  await connectDb();
  const wl = await Watchlist.findById(watchlistId).lean<WatchlistDocument | null>();
  if (!wl || wl.ownerId !== userId) return null;
  const code = newInviteCode();
  await Watchlist.updateOne({ _id: watchlistId }, { $set: { inviteCode: code } });
  const updated = await Watchlist.findById(watchlistId).lean<WatchlistDocument | null>();
  return updated ? serializeWatchlist(updated) : null;
}

export async function removeMember(watchlistId: string, userId: string) {
  await connectDb();
  await Watchlist.updateOne(
    { _id: watchlistId },
    { $pull: { memberIds: userId } },
  );
  await WatchItem.deleteMany({ watchlistId, addedBy: userId });
}
