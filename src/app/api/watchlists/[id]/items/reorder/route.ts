import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { reorderSchema } from "@/lib/validation";
import { reorderItems } from "@/lib/watch-items";

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
  }

  const items = await reorderItems(params.id, user.id, parsed.data.ids);
  if (!items) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ items });
}
