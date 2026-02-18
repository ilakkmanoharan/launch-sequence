"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = { id: string; questionText: string; answerText: string | null; bank?: { name: string } };
type Bank = { id: string; name: string; _count?: { questions: number } };

export default function FlashCardsPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankId, setBankId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!bankId) {
      setQuestions([]);
      setIndex(0);
      return;
    }
    fetch(`/api/banks/${bankId}`)
      .then((r) => r.json())
      .then((data) => {
        const qs = data?.questions ?? [];
        setQuestions(qs);
        setIndex(0);
        setShowAnswer(false);
      });
  }, [bankId]);

  async function recordFlash(correct: boolean) {
    const q = questions[index];
    if (!q) return;
    try {
      await fetch(`/api/questions/${q.id}/flash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correct }),
      });
    } catch {
      // ignore
    }
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setShowAnswer(false);
    } else {
      setQuestions([]);
      setIndex(0);
      setBankId("");
    }
  }

  const current = questions[index];
  if (loading) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <Link href="/interview" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4 inline-block">
        ← Interview Prep
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Flash cards</h1>

      {!bankId ? (
        <div>
          <label className="block text-sm font-medium mb-2">Choose a question bank</label>
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 min-w-[200px]"
          >
            <option value="">Select…</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b._count?.questions ?? 0})
              </option>
            ))}
          </select>
          {banks.length === 0 && (
            <p className="text-zinc-500 mt-2">No question banks yet. Create one from Interview Prep.</p>
          )}
        </div>
      ) : !current ? (
        <p className="text-zinc-500">No questions in this bank or you’ve finished.</p>
      ) : (
        <div className="max-w-2xl">
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4">
            <p className="text-lg font-medium">{current.questionText}</p>
            {showAnswer && current.answerText && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{current.answerText}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!showAnswer ? (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium"
              >
                Show answer
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => recordFlash(true)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium"
                >
                  Correct
                </button>
                <button
                  type="button"
                  onClick={() => recordFlash(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium"
                >
                  Incorrect
                </button>
              </>
            )}
          </div>
          <p className="text-zinc-500 text-sm mt-2">
            Card {index + 1} of {questions.length}
          </p>
        </div>
      )}
    </div>
  );
}
