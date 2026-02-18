import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreatePositionSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional().nullable(),
  url: z.string().url(),
  source: z.string().optional().nullable(),
  status: z.enum(["pending", "applied", "needs_info", "rejected"]).optional(),
  requiredInfo: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  try {
    const positions = await prisma.position.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(positions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreatePositionSchema.parse(body);
    const position = await prisma.position.create({
      data: {
        title: data.title,
        company: data.company ?? null,
        url: data.url,
        source: data.source ?? null,
        status: data.status ?? "pending",
        requiredInfo: data.requiredInfo ?? null,
      },
    });
    return NextResponse.json(position);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 });
  }
}
