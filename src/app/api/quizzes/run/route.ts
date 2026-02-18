import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RunQuizSchema = z.object({
  bankId: z.string().optional().nullable(),
  count: z.number().int().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { bankId, count = 10 } = RunQuizSchema.parse(body);
    const where = bankId ? { bankId } : {};
    const questions = await prisma.question.findMany({
      where,
      take: count,
      orderBy: { id: "asc" }, // deterministic for same "run"
    });
    return NextResponse.json({ questions });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to run quiz" }, { status: 500 });
  }
}
