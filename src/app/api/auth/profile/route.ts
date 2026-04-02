import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { bunnies } = await req.json();

  if (typeof bunnies !== "number" || bunnies < 0 || !Number.isInteger(bunnies)) {
    return NextResponse.json({ error: "Bunnies must be a non-negative integer" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { bunnies },
    select: { id: true, username: true, bunnies: true },
  });

  return NextResponse.json(user);
}
