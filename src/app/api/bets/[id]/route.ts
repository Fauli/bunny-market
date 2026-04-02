import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  const bet = await prisma.bet.findUnique({
    where: { id },
    include: { market: true },
  });

  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }

  if (bet.market.resolved) {
    return NextResponse.json({ error: "Cannot delete bets on resolved markets" }, { status: 400 });
  }

  // Refund the bet and update market totals
  await prisma.$transaction([
    prisma.bet.delete({ where: { id } }),
    prisma.user.update({
      where: { id: bet.userId },
      data: { bunnies: { increment: bet.amount } },
    }),
    prisma.market.update({
      where: { id: bet.marketId },
      data: bet.option === "A"
        ? { totalA: { decrement: bet.amount } }
        : { totalB: { decrement: bet.amount } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
