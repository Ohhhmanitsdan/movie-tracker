import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { watchlistCreateSchema } from "@/lib/validation";
import { createWatchlist, listWatchlists } from "@/lib/watchlists";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const watchlists = await listWatchlists(user.id);
  return NextResponse.json({ watchlists });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = watchlistCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const watchlist = await createWatchlist(user.id, parsed.data.name);
  return NextResponse.json({ watchlist });
}
