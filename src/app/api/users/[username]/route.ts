import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bunnies: true,
      createdAt: true,
      _count: { select: { markets: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const bets = await prisma.bet.findMany({
    where: { userId: user.id },
    include: {
      market: {
        select: { id: true, title: true, resolved: true, winner: true, optionA: true, optionB: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let wins = 0;
  let losses = 0;

  const recentBets = bets.slice(0, 10).map((bet) => {
    const won = bet.market.resolved && bet.market.winner === bet.option;
    const lost = bet.market.resolved && bet.market.winner !== bet.option;
    return {
      id: bet.id,
      marketId: bet.market.id,
      marketTitle: bet.market.title,
      optionLabel: bet.option === "A" ? bet.market.optionA : bet.market.optionB,
      amount: bet.amount,
      payout: bet.payout,
      won: won ? true : lost ? false : null,
      createdAt: bet.createdAt,
    };
  });

  bets.forEach((bet) => {
    if (bet.market.resolved && bet.market.winner === bet.option) wins++;
    else if (bet.market.resolved && bet.market.winner !== bet.option) losses++;
  });

  return NextResponse.json({
    username: user.username,
    joinDate: user.createdAt,
    bunnies: user.bunnies,
    marketsCreated: user._count.markets,
    totalBets: bets.length,
    wins,
    losses,
    winRate: bets.length > 0 ? Math.round((wins / bets.length) * 100) : 0,
    recentBets,
  });
}
