import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchTMDB } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const typeParam = (searchParams.get("type") ?? "multi") as MediaType | "multi";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchTMDB(query, typeParam);
    return NextResponse.json(results);
  } catch (error) {
    console.error("TMDB search failed", error);
    return NextResponse.json({ error: "TMDB search failed" }, { status: 500 });
  }
}
