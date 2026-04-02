import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

const ALLOWED_EMOJIS = ["fire", "bear", "rocket", "skull", "clown", "heart"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: marketId } = await params;
  const { emoji } = await req.json();

  if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  const existing = await prisma.reaction.findUnique({
    where: { userId_marketId_emoji: { userId, marketId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ toggled: "off" });
  } else {
    await prisma.reaction.create({ data: { emoji, userId, marketId } });
    return NextResponse.json({ toggled: "on" });
  }
}
