import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateBankSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const banks = await prisma.questionBank.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { questions: true } } },
    });
    return NextResponse.json(banks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateBankSchema.parse(body);
    const bank = await prisma.questionBank.create({
      data: { name: data.name, description: data.description ?? null },
    });
    return NextResponse.json(bank);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create bank" }, { status: 500 });
  }
}
