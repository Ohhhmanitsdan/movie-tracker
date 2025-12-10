import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchOMDB } from "@/lib/omdb";
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
    const results = await searchOMDB(query, typeParam);
    return NextResponse.json(results);
  } catch (error) {
    console.error("OMDB search failed", error);
    return NextResponse.json({ error: "OMDB search failed" }, { status: 500 });
  }
}
