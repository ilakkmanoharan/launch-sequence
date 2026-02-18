import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateResumeSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
  profileId: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(resumes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateResumeSchema.parse(body);
    const profile = await prisma.profile.findFirst();
    const profileId = data.profileId ?? profile?.id;
    if (!profileId) {
      const p = await prisma.profile.create({ data: {} });
      const resume = await prisma.resume.create({
        data: {
          profileId: p.id,
          title: data.title,
          content: data.content,
          isDefault: data.isDefault ?? false,
        },
      });
      return NextResponse.json(resume);
    }
    if (data.isDefault) {
      await prisma.resume.updateMany({ data: { isDefault: false } });
    }
    const resume = await prisma.resume.create({
      data: {
        profileId,
        title: data.title,
        content: data.content,
        isDefault: data.isDefault ?? false,
      },
    });
    return NextResponse.json(resume);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.issues, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
