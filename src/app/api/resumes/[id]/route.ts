import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateResumeSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(resume);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdateResumeSchema.parse(body);
    if (data.isDefault) {
      await prisma.resume.updateMany({ data: { isDefault: false } });
    }
    const resume = await prisma.resume.update({ where: { id }, data });
    return NextResponse.json(resume);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.resume.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
