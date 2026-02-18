import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatRequiredInfoMd } from "@/lib/positions-md";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * For positions with status "needs_info" and requiredInfo set,
 * write a .md file to data/required-info/<positionId>.md
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const positionId = body.positionId as string | undefined;
    const dir = path.join(process.cwd(), "data", "required-info");
    await mkdir(dir, { recursive: true });

    const where = positionId
      ? { id: positionId, status: "needs_info", requiredInfo: { not: null } }
      : { status: "needs_info", requiredInfo: { not: null } };

    const positions = await prisma.position.findMany({
      where,
    });

    const written: string[] = [];
    for (const p of positions) {
      if (!p.requiredInfo) continue;
      const content = formatRequiredInfoMd({
        positionTitle: p.title,
        company: p.company,
        url: p.url,
        requiredInfo: p.requiredInfo,
      });
      const filename = `${p.id}.md`;
      const filePath = path.join(dir, filename);
      await writeFile(filePath, content, "utf-8");
      written.push(filename);
    }

    return NextResponse.json({ written, count: written.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to export required info" },
      { status: 500 }
    );
  }
}
