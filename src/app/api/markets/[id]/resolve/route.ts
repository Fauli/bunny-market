import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: marketId } = await params;
  const { winner } = await req.json();

  if (!["A", "B"].includes(winner)) {
    return NextResponse.json({ error: "Winner must be A or B" }, { status: 400 });
  }

  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: { bets: true },
  });

  if (!market) return NextResponse.json({ error: "Market not found" }, { status: 404 });
  if (market.creatorId !== userId) {
    return NextResponse.json({ error: "Only the creator can resolve" }, { status: 403 });
  }
  if (market.resolved) return NextResponse.json({ error: "Already resolved" }, { status: 400 });

  const totalPool = market.totalA + market.totalB;
  const winningBets = market.bets.filter((b) => b.option === winner);

  // Pay out winners proportionally
  const updates = winningBets.map((bet) => {
    const winningPool = winner === "A" ? market.totalA : market.totalB;
    const payout = winningPool > 0 ? Math.floor((bet.amount / winningPool) * totalPool) : 0;
    return prisma.user.update({
      where: { id: bet.userId },
      data: { bunnies: { increment: payout } },
    });
  });

  const betUpdates = winningBets.map((bet) =>
    prisma.bet.update({ where: { id: bet.id }, data: { paidOut: true } })
  );

  await prisma.$transaction([
    prisma.market.update({
      where: { id: marketId },
      data: { resolved: true, winner },
    }),
    ...updates,
    ...betUpdates,
  ]);

  return NextResponse.json({ ok: true });
}
