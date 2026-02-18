/**
 * Sync data/positions.md into the database.
 * Run: npx tsx scripts/sync-positions-from-md.ts
 * Requires DATABASE_URL and Prisma client (run from project root).
 */
import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { parsePositionsMd } from "../src/lib/positions-md";

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const filePath = path.join(process.cwd(), "data", "positions.md");
  const content = await readFile(filePath, "utf-8");
  const positions = parsePositionsMd(content);

  for (const p of positions) {
    const existing = await prisma.position.findFirst({ where: { url: p.url } });
    if (existing) {
      await prisma.position.update({
        where: { id: existing.id },
        data: { title: p.title, company: p.company ?? null },
      });
      console.log("Updated:", p.title);
    } else {
      await prisma.position.create({
        data: {
          title: p.title,
          company: p.company ?? null,
          url: p.url,
          status: "pending",
        },
      });
      console.log("Created:", p.title);
    }
  }
  console.log("Done. Synced", positions.length, "positions.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
