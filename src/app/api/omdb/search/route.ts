import { NextResponse, type NextRequest } from "next/server";
import { authenticateRequest, clearSessionCookie } from "@/lib/auth";
import { searchOMDB } from "@/lib/omdb";
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const typeParam = (searchParams.get("type") ?? "multi") as MediaType | "multi";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchOMDB(query, typeParam);
    const res = NextResponse.json(results);
    if (auth.setCookie) {
      res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
    }
    return res;
  } catch (error) {
    console.error("OMDB search failed", error);
    return NextResponse.json({ error: "OMDB search failed" }, { status: 500 });
  }
}
