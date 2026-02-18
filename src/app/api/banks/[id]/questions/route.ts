import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateQuestionSchema = z.object({
  questionText: z.string().min(1),
  answerText: z.string().optional().nullable(),
  type: z.enum(["qa", "behavioral", "technical", "puzzle"]).optional(),
  difficulty: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: bankId } = await params;
  try {
    const questions = await prisma.question.findMany({
      where: { bankId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(questions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: bankId } = await params;
  try {
    const body = await request.json();
    const data = CreateQuestionSchema.parse(body);
    const question = await prisma.question.create({
      data: {
        bankId,
        questionText: data.questionText,
        answerText: data.answerText ?? null,
        type: data.type ?? "qa",
        difficulty: data.difficulty ?? null,
        tags: data.tags ?? null,
        source: data.source ?? null,
      },
    });
    return NextResponse.json(question);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
