import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { bunnies } = await req.json();

  if (typeof bunnies !== "number" || bunnies < 0 || !Number.isInteger(bunnies) || bunnies > 1_000_000) {
    return NextResponse.json({ error: "Bunnies must be an integer between 0 and 1,000,000" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { bunnies },
    select: { id: true, username: true, bunnies: true },
  });

  return NextResponse.json(user);
}
