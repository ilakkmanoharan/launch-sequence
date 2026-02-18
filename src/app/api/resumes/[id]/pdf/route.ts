import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mdToPdf } from "md-to-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    const pdf = await mdToPdf(
      { content: resume.content },
      {
        pdf_options: {
          format: "A4",
          margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
          printBackground: true,
        },
      }
    );
    if (!pdf?.content) {
      return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }

    const filename = `${resume.title.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
    return new NextResponse(pdf.content as Buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF generation failed" },
      { status: 500 }
    );
  }
}
