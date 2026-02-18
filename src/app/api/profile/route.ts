import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  linkedIn: z.string().url().optional().nullable().or(z.literal("")),
  website: z.string().url().optional().nullable().or(z.literal("")),
  summary: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    return NextResponse.json(profile ?? null);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const data = ProfileSchema.partial().parse(body);
    const existing = await prisma.profile.findFirst();
    const profile = existing
      ? await prisma.profile.update({ where: { id: existing.id }, data })
      : await prisma.profile.create({ data: data as Record<string, unknown> });
    return NextResponse.json(profile);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
