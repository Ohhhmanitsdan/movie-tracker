import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cleared = clearSessionCookie();
  response.cookies.set(cleared.name, cleared.value, cleared.options);
  return response;
}
