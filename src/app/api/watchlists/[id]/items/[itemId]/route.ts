import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ratingSchema } from "@/lib/validation";
import { updateRating } from "@/lib/watch-items";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = ratingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const updated = await updateRating(id, itemId, user.id, parsed.data.starRating);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: updated });
}
