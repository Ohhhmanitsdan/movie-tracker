import { NextResponse, type NextRequest } from "next/server";
import { authenticateRequest, clearSessionCookie } from "@/lib/auth";
import { getOmdbDetails } from "@/lib/omdb";
import type { MediaType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.status !== "ok") {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.clearCookie) {
      const cleared = clearSessionCookie();
      res.cookies.set(cleared.name, cleared.value, cleared.options);
    }
    return res;
  }

  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("imdbId");
  const typeParam = searchParams.get("type") as MediaType | null;

  if (!imdbId || !typeParam) {
    return NextResponse.json(
      { error: "imdbId and type are required" },
      { status: 400 },
    );
  }

  try {
    const details = await getOmdbDetails(imdbId, typeParam);
    const res = NextResponse.json(details);
    if (auth.setCookie) {
      res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
    }
    return res;
  } catch (error) {
    console.error("OMDB details failed", error);
    return NextResponse.json({ error: "OMDB lookup failed" }, { status: 500 });
  }
}
