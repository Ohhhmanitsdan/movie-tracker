import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

const sessionPassword = process.env.SESSION_PASSWORD || process.env.JWT_SECRET;
const sessionTtl = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 2);

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error("Missing SESSION_PASSWORD (32+ chars) for iron-session.");
}

export type SessionData = {
  user?: {
    id: string;
    username: string;
    email?: string;
  };
};

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: process.env.SESSION_COOKIE_NAME || "watchlist_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  ttl: sessionTtl,
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
