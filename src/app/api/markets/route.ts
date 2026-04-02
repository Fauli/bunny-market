import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { username: true } },
      _count: { select: { bets: true } },
    },
  });
  return NextResponse.json(markets);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description, optionA, optionB, detailA, detailB, endDate } = await req.json();

  if (!title || !optionA || !optionB || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const market = await prisma.market.create({
    data: {
      title,
      description: description || "",
      optionA,
      optionB,
      detailA: detailA || "",
      detailB: detailB || "",
      endDate: new Date(endDate),
      creatorId: userId,
    },
  });

  return NextResponse.json(market, { status: 201 });
}
