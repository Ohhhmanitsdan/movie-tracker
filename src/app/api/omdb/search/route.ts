import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchOMDB } from "@/lib/omdb";
import type { MediaType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const typeParam = (searchParams.get("type") ?? "multi") as MediaType | "multi";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchOMDB(query, typeParam);
    return NextResponse.json(results);
  } catch (error) {
    console.error("OMDB search failed", error);
    return NextResponse.json({ error: "OMDB search failed" }, { status: 500 });
  }
}
