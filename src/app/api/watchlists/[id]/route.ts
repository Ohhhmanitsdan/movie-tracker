import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWatchlistForUser } from "@/lib/watchlists";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const watchlist = await getWatchlistForUser(id, user.id);
  if (!watchlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ watchlist });
}
