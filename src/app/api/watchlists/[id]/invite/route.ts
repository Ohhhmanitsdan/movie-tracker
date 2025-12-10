import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { regenerateInviteCode, getWatchlistForUser } from "@/lib/watchlists";

type Params = { params: { id: string } };

export async function POST(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await getWatchlistForUser(params.id, user.id);
  if (!watchlist || watchlist.ownerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await regenerateInviteCode(params.id, user.id);
  if (!updated) return NextResponse.json({ error: "Unable to regenerate invite" }, { status: 500 });

  return NextResponse.json({ watchlist: updated, inviteLink: `/app/watchlists/${params.id}?code=${updated.inviteCode}` });
}
