import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdatePositionSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().optional().nullable(),
  url: z.string().url().optional(),
  source: z.string().optional().nullable(),
  status: z.enum(["pending", "applied", "needs_info", "rejected"]).optional(),
  requiredInfo: z.string().optional().nullable(),
  appliedAt: z.string().datetime().optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const position = await prisma.position.findUnique({ where: { id } });
    if (!position) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(position);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch position" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data = UpdatePositionSchema.parse(body);
    const update: Record<string, unknown> = { ...data };
    if (data.appliedAt !== undefined) {
      update.appliedAt = data.appliedAt ? new Date(data.appliedAt) : null;
    }
    const position = await prisma.position.update({ where: { id }, data: update });
    return NextResponse.json(position);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.position.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete position" }, { status: 500 });
  }
}
