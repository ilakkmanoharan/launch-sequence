"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Question = {
  id: string;
  questionText: string;
  answerText: string | null;
  type: string;
  difficulty: string | null;
  tags: string | null;
};
type Bank = { id: string; name: string; description: string | null; questions: Question[] };

export default function BankDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [type, setType] = useState("qa");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/banks/${id}`)
      .then((r) => r.json())
      .then((data) => (data?.id ? setBank(data) : setBank(null)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/banks/${id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: questionText.trim(),
          answerText: answerText.trim() || null,
          type,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      setBank((prev) => (prev ? { ...prev, questions: [created, ...prev.questions] } : null));
      setQuestionText("");
      setAnswerText("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(qId: string) {
    try {
      await fetch(`/api/questions/${qId}`, { method: "DELETE" });
      setBank((prev) =>
        prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== qId) } : null
      );
    } catch {
      // ignore
    }
  }

  if (loading || !bank) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/interview" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Interview Prep
        </Link>
        <h1 className="text-2xl font-semibold">{bank.name}</h1>
      </div>
      {bank.description && (
        <p className="text-zinc-500 mb-6">{bank.description}</p>
      )}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
        >
          {showForm ? "Cancel" : "Add question"}
        </button>
        {showForm && (
          <form onSubmit={handleAddQuestion} className="mt-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border space-y-3 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer (optional)</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
              >
                <option value="qa">Q&A</option>
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="puzzle">Puzzle</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add"}
            </button>
          </form>
        )}
      </div>

      <ul className="space-y-4">
        {bank.questions.map((q) => (
          <li
            key={q.id}
            className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <p className="font-medium">{q.questionText}</p>
            {q.answerText && (
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2 whitespace-pre-wrap">{q.answerText}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-zinc-500">{q.type}</span>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="text-xs text-zinc-400 hover:text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {bank.questions.length === 0 && (
        <p className="text-zinc-500">No questions yet. Add one above.</p>
      )}
    </div>
  );
}
