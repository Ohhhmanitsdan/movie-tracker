import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import {
  buildSessionForUser,
  clearSessionCookie,
} from "@/lib/auth";
import { ensureSeedUser, findUserByUsername } from "@/lib/users";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const rawUsername = typeof body.username === "string" ? body.username : "";
  const username = rawUsername.trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  await ensureSeedUser();

  const user = await findUserByUsername(username);
  if (!user) {
    const res = NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
    const cleared = clearSessionCookie();
    res.cookies.set(cleared.name, cleared.value, cleared.options);
    return res;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const res = NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
    const cleared = clearSessionCookie();
    res.cookies.set(cleared.name, cleared.value, cleared.options);
    return res;
  }

  if (user.status !== "active") {
    const res = NextResponse.json(
      { error: "User is disabled." },
      { status: 403 },
    );
    const cleared = clearSessionCookie();
    res.cookies.set(cleared.name, cleared.value, cleared.options);
    return res;
  }

  try {
    const { session, cookie } = await buildSessionForUser(user);
    const response = NextResponse.json({ session });
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error("Failed to create session", error);
    const res = NextResponse.json(
      { error: "Unable to create session." },
      { status: 500 },
    );
    const cleared = clearSessionCookie();
    res.cookies.set(cleared.name, cleared.value, cleared.options);
    return res;
  }
}
