import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ActivityItem = {
  type: "bet" | "market_created" | "comment" | "resolution";
  username: string;
  marketId: string;
  marketTitle: string;
  detail: string;
  timestamp: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20") || 20, 50);

  const [bets, markets, comments, resolutions] = await Promise.all([
    prisma.bet.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true } },
        market: { select: { id: true, title: true, optionA: true, optionB: true } },
      },
    }),
    prisma.market.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true, creator: { select: { username: true } } },
    }),
    prisma.comment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true } },
        market: { select: { id: true, title: true } },
      },
    }),
    prisma.market.findMany({
      where: { resolved: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, winner: true, optionA: true, optionB: true, createdAt: true },
    }),
  ]);

  const items: ActivityItem[] = [
    ...bets.map((b) => ({
      type: "bet" as const,
      username: b.user.username,
      marketId: b.market.id,
      marketTitle: b.market.title,
      detail: `bet ${b.amount.toLocaleString()} on ${b.option === "A" ? b.market.optionA : b.market.optionB}`,
      timestamp: b.createdAt.toISOString(),
    })),
    ...markets.map((m) => ({
      type: "market_created" as const,
      username: m.creator.username,
      marketId: m.id,
      marketTitle: m.title,
      detail: "created a new market",
      timestamp: m.createdAt.toISOString(),
    })),
    ...comments.map((c) => ({
      type: "comment" as const,
      username: c.user.username,
      marketId: c.market.id,
      marketTitle: c.market.title,
      detail: `commented: "${c.text.length > 60 ? c.text.slice(0, 60) + "..." : c.text}"`,
      timestamp: c.createdAt.toISOString(),
    })),
    ...resolutions.map((m) => ({
      type: "resolution" as const,
      username: "",
      marketId: m.id,
      marketTitle: m.title,
      detail: `resolved: ${m.winner === "A" ? m.optionA : m.optionB} won`,
      timestamp: m.createdAt.toISOString(),
    })),
  ];

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(items.slice(0, limit));
}
