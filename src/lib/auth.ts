import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import {
  DEV_FAKE_SESSION,
  JWT_SECRET,
  SECURE_COOKIES,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "./auth/config";
import { findUserById, type UserRecord } from "./users";
import type { SessionUser } from "./types";

type TokenPayload = {
  sub: string;
  username: string;
  role: SessionUser["role"];
  status: SessionUser["status"];
  sessionVersion: number;
  secretClearance: boolean;
};

export type SessionCookie = {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    path: string;
    maxAge: number;
  };
};

type AuthSuccess = {
  status: "ok";
  session: SessionUser;
  setCookie?: SessionCookie;
};

type AuthFailure = {
  status: "unauthorized";
  clearCookie: boolean;
};

export type AuthResult = AuthSuccess | AuthFailure;

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET. Add it to your environment.");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

function toSessionUser(user: UserRecord): SessionUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
    sessionVersion: user.sessionVersion,
    secretClearance: user.role === "admin" ? true : user.secretClearance,
  };
}

function payloadDiffers(session: SessionUser, payload: TokenPayload) {
  return (
    session.username !== payload.username ||
    session.role !== payload.role ||
    session.status !== payload.status ||
    session.sessionVersion !== payload.sessionVersion ||
    session.secretClearance !== payload.secretClearance
  );
}

function getDevSession(): SessionUser | null {
  if (!DEV_FAKE_SESSION) return null;
  const username = process.env.DEV_FAKE_USERNAME?.trim() || "dev-admin";
  return {
    id: "dev-user",
    username,
    role: "admin",
    status: "active",
    sessionVersion: 1,
    secretClearance: true,
  };
}

function sessionCookie(token: string): SessionCookie {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: SECURE_COOKIES,
      sameSite: SECURE_COOKIES ? "none" : "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export function clearSessionCookie(): SessionCookie {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: SECURE_COOKIES,
      sameSite: SECURE_COOKIES ? "none" : "lax",
      path: "/",
      maxAge: 0,
    },
  };
}

async function signSession(session: SessionUser) {
  return new SignJWT({
    sub: session.id,
    username: session.username,
    role: session.role,
    status: session.status,
    sessionVersion: session.sessionVersion,
    secretClearance: session.secretClearance,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

async function decodeSession(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify<TokenPayload>(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function buildSessionForUser(user: UserRecord) {
  const session = toSessionUser(user);
  const token = await signSession(session);
  return { session, cookie: sessionCookie(token) };
}

export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthResult> {
  const devSession = getDevSession();
  if (devSession) {
    return { status: "ok", session: devSession };
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return { status: "unauthorized", clearCookie: false };
  }

  const payload = await decodeSession(token);
  if (!payload) {
    return { status: "unauthorized", clearCookie: true };
  }

  const user = await findUserById(payload.sub);
  if (!user || user.status !== "active") {
    return { status: "unauthorized", clearCookie: true };
  }

  const session = toSessionUser(user);

  if (payloadDiffers(session, payload)) {
    const refreshed = await signSession(session);
    return { status: "ok", session, setCookie: sessionCookie(refreshed) };
  }

  return { status: "ok", session };
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const devSession = getDevSession();
  if (devSession) {
    return devSession;
  }

  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await decodeSession(token);
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.sub);
  if (!user || user.status !== "active") {
    return null;
  }

  return toSessionUser(user);
}
