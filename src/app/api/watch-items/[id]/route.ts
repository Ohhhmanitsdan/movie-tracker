import { NextResponse, type NextRequest } from "next/server";
import { authenticateRequest, clearSessionCookie } from "@/lib/auth";
import { updateWatchItem, type UpdateWatchItemInput } from "@/lib/watch-items";
import type { WatchStatus } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateRequest(request);
  if (auth.status !== "ok") {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.clearCookie) {
      const cleared = clearSessionCookie();
      res.cookies.set(cleared.name, cleared.value, cleared.options);
    }
    return res;
  }

  const { id } = await params;
  const body = (await request.json()) as Partial<UpdateWatchItemInput>;

  const payload: UpdateWatchItemInput = {};

  if (body.status) {
    payload.status = body.status as WatchStatus;
  }

  if (body.ratingSkulls !== undefined) {
    const rating =
      body.ratingSkulls === null ? null : Number.parseInt(String(body.ratingSkulls), 10);
    if (rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "ratingSkulls must be between 1 and 5" },
        { status: 400 },
      );
    }
    payload.ratingSkulls = rating;
  }

  if (body.notes !== undefined) {
    payload.notes = body.notes ?? null;
  }

  if (body.title !== undefined) {
    payload.title = body.title;
  }

  if (body.trailerUrl !== undefined) {
    payload.trailerUrl = body.trailerUrl;
  }

  try {
    const updated = await updateWatchItem(id, payload);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const res = NextResponse.json(updated);
    if (auth.setCookie) {
      res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
    }
    return res;
  } catch (error) {
    console.error("Error updating watch item", error);
    return NextResponse.json(
      { error: "Unable to update watch item" },
      { status: 500 },
    );
  }
}
