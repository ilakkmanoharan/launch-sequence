"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewResumePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"write" | "upload">("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "upload" && uploadFile) {
        const formData = new FormData();
        formData.set("file", uploadFile);
        formData.set("title", title || uploadFile.name.replace(/\.[^.]+$/, ""));
        formData.set("isDefault", String(isDefault));
        const res = await fetch("/api/resumes/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        router.push(`/resume/${data.id}`);
      } else {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, isDefault }),
        });
        if (!res.ok) throw new Error("Failed to create");
        const data = await res.json();
        router.push(`/resume/${data.id}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">New resume</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode("write")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "write"
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              : "border border-zinc-300 dark:border-zinc-600"
          }`}
        >
          Write markdown
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "upload"
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              : "border border-zinc-300 dark:border-zinc-600"
          }`}
        >
          Upload PDF / Word / .md
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
            placeholder={mode === "upload" ? "e.g. Software Engineer 2025 (optional)" : "e.g. Software Engineer 2025"}
            required={mode === "write"}
          />
        </div>

        {mode === "write" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Content (markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm"
              placeholder="## Experience\n..."
            />
          </div>
        )}

        {mode === "upload" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">File (PDF, .docx, or .md)</label>
            <input
              type="file"
              accept=".pdf,.docx,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium"
              required={mode === "upload"}
            />
            <p className="text-zinc-500 text-xs mt-1">
              The app will store the file and convert it to markdown. Max 10 MB.
            </p>
          </div>
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          <span className="text-sm">Set as default resume</span>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || (mode === "upload" && !uploadFile)}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : mode === "upload" ? "Upload & create" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
