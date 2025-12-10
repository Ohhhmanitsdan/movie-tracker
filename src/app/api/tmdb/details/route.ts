import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDetails } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const typeParam = searchParams.get("type") as MediaType | null;

  if (!tmdbId || !typeParam) {
    return NextResponse.json(
      { error: "tmdbId and type are required" },
      { status: 400 },
    );
  }

  try {
    const details = await getDetails(tmdbId, typeParam);
    return NextResponse.json(details);
  } catch (error) {
    console.error("TMDB details failed", error);
    return NextResponse.json({ error: "TMDB lookup failed" }, { status: 500 });
  }
}
