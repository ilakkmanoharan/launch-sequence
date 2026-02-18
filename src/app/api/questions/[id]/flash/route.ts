import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const FlashSchema = z.object({ correct: z.boolean() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: questionId } = await params;
  try {
    const body = await request.json();
    const { correct } = FlashSchema.parse(body);
    const stat = await prisma.flashCardStat.create({
      data: { questionId, correct },
    });
    return NextResponse.json(stat);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to record flash card" }, { status: 500 });
  }
}
