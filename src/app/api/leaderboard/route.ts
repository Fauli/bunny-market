import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      bunnies: true,
      _count: { select: { bets: true, markets: true } },
    },
    orderBy: { bunnies: "desc" },
  });

  return NextResponse.json(users);
}
