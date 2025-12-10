import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addItem, listItems } from "@/lib/watch-items";
import { watchItemSchema } from "@/lib/validation";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await listItems(params.id, user.id);
  if (!items) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = watchItemSchema.safeParse({
    ...json,
    year: json?.year === null || json?.year === undefined ? null : Number(json.year),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid item data", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const item = await addItem(params.id, user.id, parsed.data);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}
