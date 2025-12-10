export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "epsilon_session";

export const SESSION_TTL_SECONDS = Number(
  process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 2,
);

export const SECURE_COOKIES = process.env.NODE_ENV !== "development";

export const JWT_SECRET = process.env.JWT_SECRET;

export const DEV_FAKE_SESSION =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_FAKE_SESSION === "true";
