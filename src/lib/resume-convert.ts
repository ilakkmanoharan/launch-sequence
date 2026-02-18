import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import TurndownService from "turndown";

const turndown = new TurndownService({ headingStyle: "atx" });

export type ConvertResult = { markdown: string; format: "pdf" | "docx" | "md" };

export async function fileToMarkdown(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ConvertResult> {
  const ext = (fileName.split(".").pop() ?? "").toLowerCase();
  if (mimeType === "application/pdf" || ext === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const markdown = textToMarkdown(text ?? "");
    return { markdown, format: "pdf" };
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.convertToHtml({ buffer });
    const markdown = turndown.turndown(result.value);
    return { markdown, format: "docx" };
  }
  if (mimeType === "text/markdown" || ext === "md") {
    const markdown = buffer.toString("utf-8");
    return { markdown, format: "md" };
  }
  throw new Error(`Unsupported format: ${mimeType} / ${ext}`);
}

function textToMarkdown(text: string): string {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const out: string[] = [];
  for (const line of lines) {
    if (!line) {
      out.push("");
      continue;
    }
    if (/^(experience|education|skills|summary|objective|work|projects)$/i.test(line)) {
      out.push(`## ${line.charAt(0).toUpperCase() + line.slice(1).toLowerCase()}`);
    } else {
      out.push(line);
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
