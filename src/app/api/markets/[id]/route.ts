import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      creator: { select: { username: true } },
      bets: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  // Aggregate reaction counts and current user's reactions
  const reactions = await prisma.reaction.findMany({ where: { marketId: id } });
  const reactionCounts: Record<string, number> = {};
  reactions.forEach((r) => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });

  const userId = await getCurrentUserId();
  const userReactions = userId
    ? reactions.filter((r) => r.userId === userId).map((r) => r.emoji)
    : [];

  return NextResponse.json({ ...market, reactionCounts, userReactions });
}

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
  const market = await prisma.market.findUnique({
    where: { id },
    include: { bets: true },
  });

  if (!market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  // Refund all bets if market is not resolved
  const refunds = !market.resolved
    ? market.bets.map((bet) =>
        prisma.user.update({
          where: { id: bet.userId },
          data: { bunnies: { increment: bet.amount } },
        })
      )
    : [];

  await prisma.$transaction([
    prisma.reaction.deleteMany({ where: { marketId: id } }),
    prisma.comment.deleteMany({ where: { marketId: id } }),
    prisma.oddsSnapshot.deleteMany({ where: { marketId: id } }),
    prisma.bet.deleteMany({ where: { marketId: id } }),
    prisma.market.delete({ where: { id } }),
    ...refunds,
  ]);

  return NextResponse.json({ ok: true });
}
