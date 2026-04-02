import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshots = await prisma.oddsSnapshot.findMany({
    where: { marketId: id },
    orderBy: { createdAt: "asc" },
    select: { totalA: true, totalB: true, createdAt: true },
  });
  return NextResponse.json(snapshots);
}
