import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createUser, establishSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`signup:${ip}`)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const user = await createUser(parsed.data);
    const sessionUser = await establishSession(user);
    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Username")
        ? "Username already taken."
        : error instanceof Error && error.message.includes("Email")
          ? "Email already in use."
          : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
