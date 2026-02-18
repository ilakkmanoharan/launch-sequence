import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { fileToMarkdown } from "@/lib/resume-convert";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
];
const ALLOWED_EXT = ["pdf", "docx", "md"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Resume";
    const isDefault = formData.get("isDefault") === "true";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Use PDF, .docx, or .md" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { markdown, format } = await fileToMarkdown(buffer, file.type, file.name);

    const profile = await prisma.profile.findFirst();
    let profileId = profile?.id;
    if (!profileId) {
      const p = await prisma.profile.create({ data: {} });
      profileId = p.id;
    }

    if (isDefault) {
      await prisma.resume.updateMany({ data: { isDefault: false } });
    }

    const resume = await prisma.resume.create({
      data: {
        profileId,
        title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
        content: markdown,
        isDefault: isDefault ?? false,
        originalFormat: format,
      },
    });

    const dir = path.join(process.cwd(), "data", "resumes");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${resume.id}.${ext}`);
    await writeFile(filePath, buffer);
    await prisma.resume.update({
      where: { id: resume.id },
      data: { originalFilePath: filePath },
    });

    return NextResponse.json({ ...resume, originalFilePath: filePath });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
