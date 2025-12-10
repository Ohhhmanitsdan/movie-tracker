import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWatchlistForUser } from "@/lib/watchlists";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const watchlist = await getWatchlistForUser(params.id, user.id);
  if (!watchlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ watchlist });
}
