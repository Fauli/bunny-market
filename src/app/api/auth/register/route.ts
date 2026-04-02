import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password, bunnies } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  if (username.length < 3 || password.length < 6) {
    return NextResponse.json({ error: "Username must be 3+ chars, password 6+ chars" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashed,
      bunnies: typeof bunnies === "number" && bunnies >= 0 && bunnies <= 1_000_000 ? Math.floor(bunnies) : 0,
    },
  });

  const token = signToken(user.id);
  const response = NextResponse.json({ id: user.id, username: user.username, bunnies: user.bunnies });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
