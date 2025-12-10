import { NextResponse, type NextRequest } from "next/server";
import { authenticateRequest, clearSessionCookie } from "@/lib/auth";
import {
  createWatchItem,
  getWatchItems,
  type CreateWatchItemInput,
} from "@/lib/watch-items";
import type { MediaType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.status !== "ok") {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.clearCookie) {
      const cleared = clearSessionCookie();
      res.cookies.set(cleared.name, cleared.value, cleared.options);
    }
    return res;
  }

  const items = await getWatchItems();
  const res = NextResponse.json(items);
  if (auth.setCookie) {
    res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
  }
  return res;
}

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

  const body = (await request.json()) as Partial<CreateWatchItemInput>;
  const type = body.type as MediaType | undefined;

  if (!body.imdbId || !type || !body.title) {
    return NextResponse.json(
      { error: "imdbId, type, and title are required" },
      { status: 400 },
    );
  }

  try {
    const item = await createWatchItem(
      {
        imdbId: body.imdbId,
        type,
        title: body.title,
        overview: body.overview ?? null,
        posterUrl: body.posterUrl ?? null,
        trailerUrl: body.trailerUrl ?? null,
        year: body.year ?? null,
        genres: body.genres ?? [],
        notes: body.notes ?? null,
      },
      auth.session.username,
    );

    const res = NextResponse.json(item, { status: 201 });
    if (auth.setCookie) {
      res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
    }
    return res;
  } catch (error) {
    console.error("Error creating watch item", error);
    return NextResponse.json(
      { error: "Unable to create watch item" },
      { status: 500 },
    );
  }
}
