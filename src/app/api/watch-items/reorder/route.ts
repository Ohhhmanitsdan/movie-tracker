import { NextResponse, type NextRequest } from "next/server";
import { authenticateRequest, clearSessionCookie } from "@/lib/auth";
import { reorderWatchItems } from "@/lib/watch-items";

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.status !== "ok") {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.clearCookie) {
      const cleared = clearSessionCookie();
      res.cookies.set(cleared.name, cleared.value, cleared.options);
    }
    return res;
  }

  const body = (await request.json()) as { ids?: string[] };
  const ids = body.ids;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  try {
    const reordered = await reorderWatchItems(ids);
    const res = NextResponse.json(reordered);
    if (auth.setCookie) {
      res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
    }
    return res;
  } catch (error) {
    console.error("Error reordering watch items", error);
    return NextResponse.json(
      { error: "Unable to reorder items" },
      { status: 500 },
    );
  }
}
