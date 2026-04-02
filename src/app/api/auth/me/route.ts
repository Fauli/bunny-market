import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, bunnies: true },
  });
  const isAdmin = user?.username === "fauli";
  return NextResponse.json({ user: user ? { ...user, isAdmin } : null });
}
