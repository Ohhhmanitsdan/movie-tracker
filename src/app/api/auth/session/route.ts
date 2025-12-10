import { NextResponse, type NextRequest } from "next/server";
import { authenticateRequest, clearSessionCookie } from "@/lib/auth";

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

  const res = NextResponse.json({ session: auth.session });

  if (auth.setCookie) {
    res.cookies.set(auth.setCookie.name, auth.setCookie.value, auth.setCookie.options);
  }

  return res;
}
