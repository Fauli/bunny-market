import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: marketId } = await params;
  const { amount, option } = await req.json();

  if (!amount || amount < 1 || !["A", "B"].includes(option)) {
    return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
  }

  const [user, market] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.market.findUnique({ where: { id: marketId } }),
  ]);

  if (!market) return NextResponse.json({ error: "Market not found" }, { status: 404 });
  if (market.resolved) return NextResponse.json({ error: "Market already resolved" }, { status: 400 });
  if (new Date() > market.endDate) return NextResponse.json({ error: "Market has ended" }, { status: 400 });
  if (!user || user.bunnies < amount) {
    return NextResponse.json({ error: "Not enough bunnies" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.bet.create({
      data: { amount, option, userId, marketId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { bunnies: { decrement: amount } },
    }),
    prisma.market.update({
      where: { id: marketId },
      data: option === "A" ? { totalA: { increment: amount } } : { totalB: { increment: amount } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
