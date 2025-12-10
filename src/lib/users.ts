import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./db";
import type { UserRole, UserStatus } from "./types";

type UserDoc = {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  sessionVersion: number;
  secretClearance: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRecord = {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  sessionVersion: number;
  secretClearance: boolean;
  createdAt: string;
  updatedAt: string;
};

const collectionName = "users";

async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>(collectionName);
}

function serializeUser(doc: UserDoc): UserRecord {
  return {
    id: doc._id.toString(),
    username: doc.username,
    passwordHash: doc.passwordHash,
    role: doc.role,
    status: doc.status,
    sessionVersion: doc.sessionVersion,
    secretClearance: doc.secretClearance,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function findUserByUsername(
  username: string,
): Promise<UserRecord | null> {
  const normalized = username.trim().toLowerCase();
  const col = await usersCollection();
  const user = await col.findOne({ username: normalized });
  return user ? serializeUser(user) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const col = await usersCollection();
  const objectId = new ObjectId(id);
  const user = await col.findOne({ _id: objectId });
  return user ? serializeUser(user) : null;
}

export async function ensureSeedUser(): Promise<UserRecord | null> {
  const username = process.env.AUTH_USERNAME?.trim().toLowerCase();
  const passwordHash = process.env.AUTH_PASSWORD_HASH?.trim();

  if (!username || !passwordHash) {
    return null;
  }

  const role: UserRole = process.env.AUTH_ROLE === "admin" ? "admin" : "user";
  const status: UserStatus =
    process.env.AUTH_STATUS === "disabled" ? "disabled" : "active";
  const sessionVersion =
    Number.parseInt(process.env.AUTH_SESSION_VERSION ?? "1", 10) || 1;
  const secretClearance =
    role === "admin" || process.env.AUTH_SECRET_CLEARANCE === "true";

  const col = await usersCollection();
  const existing = await col.findOne({ username });
  const now = new Date();

  if (!existing) {
    const doc: Omit<UserDoc, "_id"> = {
      username,
      passwordHash,
      role,
      status,
      sessionVersion,
      secretClearance,
      createdAt: now,
      updatedAt: now,
    };
    const result = await col.insertOne(doc);
    return serializeUser({ ...doc, _id: result.insertedId });
  }

  const updates: Partial<UserDoc> = {};

  if (existing.passwordHash !== passwordHash) updates.passwordHash = passwordHash;
  if (existing.role !== role) updates.role = role;
  if (existing.status !== status) updates.status = status;
  if (existing.sessionVersion !== sessionVersion) {
    updates.sessionVersion = sessionVersion;
  }
  if (existing.secretClearance !== secretClearance) {
    updates.secretClearance = secretClearance;
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = now;
    await col.updateOne({ _id: existing._id }, { $set: updates });
    const refreshed = await col.findOne({ _id: existing._id });
    return refreshed ? serializeUser(refreshed) : null;
  }

  return serializeUser(existing);
}
