import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error:
          "Resume changes require an OpenAI API key. Add OPENAI_API_KEY to your .env file (or Vercel environment variables), then restart the dev server.",
      },
      { status: 503 }
    );
  }
  try {
    const openai = new OpenAI({ apiKey });
    const body = await request.json();
    const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
    if (!instruction) {
      return NextResponse.json({ error: "instruction is required" }, { status: 400 });
    }
    const save = body.save === true;

    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a resume editor. You will be given the current resume content in markdown and a user instruction. Return ONLY the updated resume content in markdown, with the requested changes applied. Do not add commentary or explanations.",
        },
        {
          role: "user",
          content: `Current resume (markdown):\n\n${resume.content}\n\nUser request: ${instruction}\n\nReturn only the updated markdown resume.`,
        },
      ],
      temperature: 0.3,
    });

    const newContent = completion.choices[0]?.message?.content?.trim();
    if (!newContent) {
      return NextResponse.json({ error: "No content returned from AI" }, { status: 500 });
    }

    if (!save) {
      return NextResponse.json({ content: newContent });
    }

    const versionDescription =
      typeof body.versionDescription === "string" ? body.versionDescription.trim() || null : null;
    const updated = await prisma.resume.update({
      where: { id },
      data: {
        content: newContent,
        version: resume.version + 1,
        lastVersionDescription: versionDescription,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "AI edit failed";
    const err = e as { status?: number; code?: string; type?: string };
    const isQuotaError =
      err?.status === 429 ||
      err?.code === "insufficient_quota" ||
      err?.type === "insufficient_quota" ||
      (typeof message === "string" && (message.includes("429") || message.includes("quota") || message.includes("billing")));
    const isAuthError =
      !isQuotaError &&
      typeof message === "string" &&
      (message.includes("credentials") || message.includes("API key") || message.includes("401"));
    let userMessage = message;
    if (isQuotaError) {
      userMessage =
        "You've used up your OpenAI quota. Add a payment method at https://platform.openai.com/account/billing (or check your plan and usage) to use Resume change again.";
    } else if (isAuthError) {
      userMessage =
        "OpenAI API key is missing or invalid. Check OPENAI_API_KEY in .env and that your key has access to the API.";
    }
    return NextResponse.json(
      { error: userMessage },
      { status: isQuotaError || isAuthError ? 503 : 500 }
    );
  }
}
