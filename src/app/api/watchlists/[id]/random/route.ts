import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { randomItem } from "@/lib/watch-items";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") ?? undefined;
  const typeParam = searchParams.get("type");
  const type = typeParam === "movie" || typeParam === "series" ? typeParam : undefined;
  const minRating = searchParams.get("minRating");

  const item = await randomItem(id, user.id, {
    genre,
    type,
    minRating: minRating ? Number(minRating) : undefined,
  });

  if (!item) return NextResponse.json({ error: "No items match filters" }, { status: 404 });
  return NextResponse.json({ item });
}
