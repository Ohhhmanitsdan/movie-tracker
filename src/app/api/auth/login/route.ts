import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { establishSession, findUserByUsername, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`login:${ip}`)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 400 },
    );
  }

  const user = await findUserByUsername(parsed.data.username);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await verifyPassword(user, parsed.data.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const sessionUser = await establishSession(user);
  return NextResponse.json({ user: sessionUser });
}
