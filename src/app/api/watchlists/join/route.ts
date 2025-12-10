import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { joinSchema } from "@/lib/validation";
import { joinWatchlistByCode } from "@/lib/watchlists";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = joinSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid join code." }, { status: 400 });
  }

  const watchlist = await joinWatchlistByCode(user.id, parsed.data.code);
  if (!watchlist) {
    return NextResponse.json({ error: "Invalid or expired invite code." }, { status: 404 });
  }

  return NextResponse.json({ watchlist });
}
