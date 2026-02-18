import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RecordResultSchema = z.object({
  quizId: z.string(),
  score: z.number().int().min(0),
  total: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = RecordResultSchema.parse(body);
    const result = await prisma.quizResult.create({
      data: { quizId: data.quizId, score: data.score, total: data.total },
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to record result" }, { status: 500 });
  }
}
