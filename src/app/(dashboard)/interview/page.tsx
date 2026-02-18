"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bank = { id: string; name: string; description: string | null; _count?: { questions: number } };

export default function InterviewPrepPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      setBanks((prev) => [...prev, { ...created, _count: { questions: 0 } }]);
      setNewName("");
      setNewDesc("");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Interview Prep</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/interview/flash"
          className="block p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <h2 className="font-medium text-lg">Flash cards</h2>
          <p className="text-zinc-500 text-sm mt-1">Review questions as flash cards and track correct/incorrect.</p>
        </Link>
        <Link
          href="/interview/quiz"
          className="block p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <h2 className="font-medium text-lg">Quiz</h2>
          <p className="text-zinc-500 text-sm mt-1">Run a quiz from a question bank and record your score.</p>
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">Question banks</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Bank name (e.g. System Design)"
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description"
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add bank"}
          </button>
        </form>
        <ul className="space-y-2">
          {banks.map((b) => (
            <li key={b.id}>
              <Link
                href={`/interview/banks/${b.id}`}
                className="block p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <span className="font-medium">{b.name}</span>
                <span className="text-zinc-500 text-sm ml-2">
                  {b._count?.questions ?? 0} questions
                </span>
                {b.description && (
                  <p className="text-zinc-500 text-sm mt-1">{b.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
