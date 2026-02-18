"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { diffLines, type Change } from "diff";

type Resume = {
  id: string;
  title: string;
  content: string;
  version?: number;
  isDefault: boolean;
  originalFormat?: string | null;
  originalFilePath?: string | null;
  lastVersionDescription?: string | null;
  updatedAt?: string;
};

export default function ResumeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [versionDescription, setVersionDescription] = useState("");
  const [saveConfirmLoading, setSaveConfirmLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setResume(data);
          setTitle(data.title);
          setContent(data.content);
        }
      })
      .catch(() => setResume(null));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setResume(data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleAiEdit() {
    if (!aiInstruction.trim()) return;
    setAiLoading(true);
    setSavedMessage(null);
    try {
      const res = await fetch(`/api/resumes/${id}/ai-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: aiInstruction, save: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const reason = data?.error || (res.status === 503 ? "Service unavailable. Check that OPENAI_API_KEY is set." : "Changes could not be applied.");
        throw new Error(reason);
      }
      if (!data?.content) {
        throw new Error("No content returned. Please try again.");
      }
      setPendingContent(data.content);
      setAiInstruction("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Changes could not be applied. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSavePending() {
    if (!pendingContent) return;
    setSaveConfirmLoading(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: pendingContent,
          versionDescription: versionDescription.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setResume(data);
      setContent(data.content);
      setPendingContent(null);
      setVersionDescription("");
      setSavedMessage(
        `Saved as version ${data.version}${data.updatedAt ? ` · ${new Date(data.updatedAt).toLocaleString()}` : ""}`
      );
      setTimeout(() => setSavedMessage(null), 5000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaveConfirmLoading(false);
    }
  }

  function renderDiffPreview(oldText: string, newText: string) {
    const changes = diffLines(oldText, newText);
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
          Preview — added lines highlighted
        </div>
        <pre className="whitespace-pre-wrap font-sans text-zinc-700 dark:text-zinc-300 p-4 text-sm overflow-x-auto">
          {changes.map((part: Change, i: number) => {
            if (part.added) {
              return (
                <span key={i} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
                  {part.value}
                </span>
              );
            }
            if (part.removed) return null;
            return <span key={i}>{part.value}</span>;
          })}
        </pre>
      </div>
    );
  }

  if (!resume) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">{resume.title}</h1>
        <div className="flex gap-2 flex-wrap">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border text-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg border text-sm">
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowAi((v) => !v)}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium"
              >
                Resume change (AI)
              </button>
              <a
                href={`/api/resumes/${id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-sm font-medium inline-block"
              >
                Download PDF
              </a>
            </>
          )}
        </div>
      </div>

      {showAi && !editing && (
        <div className="mb-6 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-medium mb-2">Resume change</h2>
          <p className="text-zinc-500 text-sm mb-2">
            Describe the changes you want (e.g. &quot;Add a bullet about leading the migration to React&quot; or &quot;Shorten the summary to 2 sentences&quot;). The app uses OpenAI to apply them.
          </p>
          <textarea
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            placeholder="e.g. Add experience at Acme Corp as Senior Engineer, 2022–2024"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 mb-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAiEdit}
              disabled={aiLoading || !aiInstruction.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {aiLoading ? "Applying…" : "Apply changes"}
            </button>
            <button type="button" onClick={() => setShowAi(false)} className="px-4 py-2 rounded-lg border text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {pendingContent !== null && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Changes applied</span>
            <span className="text-emerald-700 dark:text-emerald-300 text-sm">
              Review the preview below. Add an optional description and click &quot;Ok, save it&quot; to save to your resume.
            </span>
          </div>
          {renderDiffPreview(content, pendingContent)}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Optional description for this version
            </label>
            <input
              type="text"
              value={versionDescription}
              onChange={(e) => setVersionDescription(e.target.value)}
              placeholder="e.g. Added Iteron personalization bullets"
              className="w-full max-w-md px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 mb-3"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSavePending}
                disabled={saveConfirmLoading}
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium disabled:opacity-50"
              >
                {saveConfirmLoading ? "Saving…" : "Ok, save it"}
              </button>
              <button
                type="button"
                onClick={() => { setPendingContent(null); setVersionDescription(""); }}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {savedMessage && (
        <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {savedMessage}
        </div>
      )}

      {resume.originalFormat && (
        <p className="text-zinc-500 text-sm mb-2">
          Uploaded as {resume.originalFormat.toUpperCase()}; markdown version below.
        </p>
      )}

      {editing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full max-w-md px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm"
          />
        </div>
      ) : (
        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {resume.content || "(No content)"}
          </pre>
        </div>
      )}
    </div>
  );
}
