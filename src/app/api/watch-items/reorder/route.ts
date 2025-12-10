import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { reorderWatchItems } from "@/lib/watch-items";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { ids?: string[] };
  const ids = body.ids;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  try {
    const reordered = await reorderWatchItems(ids);
    return NextResponse.json(reordered);
  } catch (error) {
    console.error("Error reordering watch items", error);
    return NextResponse.json(
      { error: "Unable to reorder items" },
      { status: 500 },
    );
  }
}
