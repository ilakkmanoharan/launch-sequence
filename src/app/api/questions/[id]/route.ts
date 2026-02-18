import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  answerText: z.string().optional().nullable(),
  type: z.enum(["qa", "behavioral", "technical", "puzzle"]).optional(),
  difficulty: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(question);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdateQuestionSchema.parse(body);
    const question = await prisma.question.update({ where: { id }, data });
    return NextResponse.json(question);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.question.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
