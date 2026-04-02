import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

const CATEGORIES = ["General", "Sports", "Politics", "Entertainment", "Science", "Office Bets", "Other"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const sort = url.searchParams.get("sort");

  const where = category && category !== "All" ? { category } : {};

  const markets = await prisma.market.findMany({
    where,
    orderBy: sort === "trending" ? [{ totalA: "desc" }, { totalB: "desc" }] : { createdAt: "desc" },
    include: {
      creator: { select: { username: true } },
      _count: { select: { bets: true } },
    },
  });

  // For trending, sort by total pool size (totalA + totalB) since Prisma can't sort by computed field
  if (sort === "trending") {
    markets.sort((a, b) => (b.totalA + b.totalB) - (a.totalA + a.totalB));
  }

  return NextResponse.json(markets);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description, optionA, optionB, detailA, detailB, endDate, category } = await req.json();

  if (!title || !optionA || !optionB || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const market = await prisma.market.create({
    data: {
      title,
      description: description || "",
      category: category && CATEGORIES.includes(category) ? category : "General",
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
