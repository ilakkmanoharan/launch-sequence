import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateKeywordSchema = z.object({
  value: z.string().min(1),
  category: z.string().optional().nullable(),
  profileId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  try {
    const keywords = await prisma.keyword.findMany({
      where: category ? { category } : undefined,
      orderBy: { value: "asc" },
    });
    return NextResponse.json(keywords);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateKeywordSchema.parse(body);
    const keyword = await prisma.keyword.create({
      data: {
        value: data.value,
        category: data.category ?? null,
        profileId: data.profileId ?? null,
      },
    });
    return NextResponse.json(keyword);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create keyword" }, { status: 500 });
  }
}
