import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateKeywordSchema = z.object({
  value: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdateKeywordSchema.parse(body);
    const keyword = await prisma.keyword.update({ where: { id }, data });
    return NextResponse.json(keyword);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update keyword" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.keyword.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete keyword" }, { status: 500 });
  }
}
