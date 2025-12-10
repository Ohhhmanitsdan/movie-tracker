import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOmdbDetails } from "@/lib/omdb";
import type { MediaType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json(details);
  } catch (error) {
    console.error("OMDB details failed", error);
    return NextResponse.json({ error: "OMDB lookup failed" }, { status: 500 });
  }
}
