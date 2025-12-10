import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  createWatchItem,
  getWatchItems,
  type CreateWatchItemInput,
} from "@/lib/watch-items";
import type { MediaType } from "@/lib/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getWatchItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<CreateWatchItemInput>;
  const type = body.type as MediaType | undefined;

  if (!body.tmdbId || !type || !body.title) {
    return NextResponse.json(
      { error: "tmdbId, type, and title are required" },
      { status: 400 },
    );
  }

  try {
    const item = await createWatchItem(
      {
        tmdbId: body.tmdbId,
        type,
        title: body.title,
        overview: body.overview ?? null,
        posterUrl: body.posterUrl ?? null,
        trailerUrl: body.trailerUrl ?? null,
        year: body.year ?? null,
        genres: body.genres ?? [],
        notes: body.notes ?? null,
      },
      session.user?.email ?? null,
    );

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating watch item", error);
    return NextResponse.json(
      { error: "Unable to create watch item" },
      { status: 500 },
    );
  }
}
