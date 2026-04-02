import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const bets = await prisma.bet.findMany({
    where: { userId },
    include: {
      market: {
        select: { id: true, title: true, resolved: true, winner: true, optionA: true, optionB: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let wins = 0;
  let losses = 0;
  let totalProfit = 0;

  const history = bets.map((bet) => {
    const isResolved = bet.market.resolved;
    const won = isResolved && bet.market.winner === bet.option;
    const lost = isResolved && bet.market.winner !== bet.option;
    const profit = won ? bet.payout - bet.amount : lost ? -bet.amount : 0;

    if (won) wins++;
    if (lost) losses++;
    totalProfit += profit;

    return {
      id: bet.id,
      marketId: bet.market.id,
      marketTitle: bet.market.title,
      option: bet.option,
      optionLabel: bet.option === "A" ? bet.market.optionA : bet.market.optionB,
      amount: bet.amount,
      payout: bet.payout,
      profit,
      won: won ? true : lost ? false : null,
      createdAt: bet.createdAt,
    };
  });

  return NextResponse.json({
    totalBets: bets.length,
    wins,
    losses,
    pending: bets.length - wins - losses,
    totalProfit,
    history,
  });
}
