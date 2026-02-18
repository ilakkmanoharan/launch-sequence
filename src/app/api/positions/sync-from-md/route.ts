import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parsePositionsMd } from "@/lib/positions-md";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    let content: string;
    const body = await request.json().catch(() => ({}));
    const filePath = (body.filePath as string) || "data/positions.md";

    if (body.content != null) {
      content = String(body.content);
    } else {
      const fullPath = path.join(process.cwd(), filePath);
      content = await readFile(fullPath, "utf-8");
    }

    const positions = parsePositionsMd(content);
    const results: { title: string; url: string; created: boolean; id: string }[] = [];

    for (const p of positions) {
      const existing = await prisma.position.findFirst({
        where: { url: p.url },
      });
      if (existing) {
        await prisma.position.update({
          where: { id: existing.id },
          data: { title: p.title, company: p.company ?? null },
        });
        results.push({ title: p.title, url: p.url, created: false, id: existing.id });
      } else {
        const created = await prisma.position.create({
          data: {
            title: p.title,
            company: p.company ?? null,
            url: p.url,
            status: "pending",
          },
        });
        results.push({ title: p.title, url: p.url, created: true, id: created.id });
      }
    }

    return NextResponse.json({ synced: results.length, results });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to sync from markdown" },
      { status: 500 }
    );
  }
}
