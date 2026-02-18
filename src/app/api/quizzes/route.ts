import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateQuizSchema = z.object({
  name: z.string().min(1),
  bankId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: { results: { orderBy: { takenAt: "desc" }, take: 5 } },
    });
    return NextResponse.json(quizzes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateQuizSchema.parse(body);
    const quiz = await prisma.quiz.create({
      data: { name: data.name, bankId: data.bankId ?? null },
    });
    return NextResponse.json(quiz);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
