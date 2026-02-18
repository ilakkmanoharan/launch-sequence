import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateBankSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const bank = await prisma.questionBank.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!bank) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(bank);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch bank" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdateBankSchema.parse(body);
    const bank = await prisma.questionBank.update({ where: { id }, data });
    return NextResponse.json(bank);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update bank" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.questionBank.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete bank" }, { status: 500 });
  }
}
