import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/app/:path*"],
};

export default async function proxy(request: NextRequest) {
  const sessionUrl = new URL("/api/auth/me", request.url);
  const sessionResponse = await fetch(sessionUrl, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (sessionResponse.ok) {
    return NextResponse.next();
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("redirected", "true");
  return NextResponse.redirect(redirectUrl);
}
