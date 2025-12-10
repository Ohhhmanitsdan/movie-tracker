import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/auth/config";

export const config = {
  matcher: ["/watchlist"],
};

export async function middleware(request: NextRequest) {
  const sessionUrl = new URL("/api/auth/session", request.url);

  let sessionResponse: Response | null = null;
  try {
    sessionResponse = await fetch(sessionUrl, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Session check failed in middleware", error);
  }

  if (sessionResponse?.ok) {
    const response = NextResponse.next();
    const setCookieHeader = sessionResponse.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }
    return response;
  }

  const redirectUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(redirectUrl);

  const setCookieHeader = sessionResponse?.headers.get("set-cookie");
  if (setCookieHeader) {
    response.headers.set("set-cookie", setCookieHeader);
  } else {
    response.cookies.delete(SESSION_COOKIE_NAME);
  }

  return response;
}
