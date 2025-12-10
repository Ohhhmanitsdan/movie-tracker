import bcrypt from "bcryptjs";
import { connectDb } from "./db";
import { User, type UserDocument } from "./models/user";
import { getSession } from "./session";
import type { SessionUser } from "./types";

function toSessionUser(user: UserDocument): SessionUser {
  return { id: user._id.toString(), username: user.username, email: user.email };
}

export async function findUserByUsername(username: string) {
  await connectDb();
  return User.findOne({ username: username.trim().toLowerCase() }).lean<UserDocument | null>();
}

export async function findUserById(id: string) {
  await connectDb();
  return User.findById(id).lean<UserDocument | null>();
}

export async function createUser(data: {
  username: string;
  email?: string;
  password: string;
}) {
  await connectDb();
  const existing = await User.findOne({ username: data.username.trim().toLowerCase() });
  if (existing) {
    throw new Error("Username already taken");
  }
  if (data.email) {
    const existingEmail = await User.findOne({ email: data.email.trim().toLowerCase() });
    if (existingEmail) {
      throw new Error("Email already in use");
    }
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    username: data.username.trim().toLowerCase(),
    email: data.email?.trim().toLowerCase(),
    passwordHash,
  });
  return user.toObject() as UserDocument;
}

export async function verifyPassword(user: UserDocument, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session.user) return null;
  const fresh = await findUserById(session.user.id);
  return fresh ? toSessionUser(fresh) : null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function establishSession(user: UserDocument) {
  const session = await getSession();
  session.user = toSessionUser(user);
  await session.save();
  return session.user;
}

export async function clearSession() {
  const session = await getSession();
  session.destroy();
}
