"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = { id: string; questionText: string; answerText: string | null };
type Bank = { id: string; name: string; _count?: { questions: number } };

export default function QuizPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankId, setBankId] = useState<string>("");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/banks")
      .then((r) => r.json())
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function startQuiz() {
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankId: bankId || null, count }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setIndex(0);
      setShowAnswer(false);
      setCorrect(0);
      setDone(false);
    } finally {
      setLoading(false);
    }
  }

  function markCorrect() {
    setCorrect((c) => c + 1);
    next();
  }

  function markIncorrect() {
    next();
  }

  function next() {
    if (index >= questions.length - 1) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setShowAnswer(false);
    }
  }

  const current = questions[index];
  if (loading && questions.length === 0) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <Link href="/interview" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4 inline-block">
        ← Interview Prep
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Quiz</h1>

      {questions.length === 0 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question bank (optional)</label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 min-w-[200px]"
            >
              <option value="">All banks</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Number of questions</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 w-20"
            />
          </div>
          <button
            type="button"
            onClick={startQuiz}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-50"
          >
            Start quiz
          </button>
        </div>
      ) : done ? (
        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-medium mb-2">Quiz complete</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Score: {correct} / {questions.length}
          </p>
          <button
            type="button"
            onClick={() => setQuestions([])}
            className="mt-4 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
          >
            Start another
          </button>
        </div>
      ) : current ? (
        <div className="max-w-2xl">
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4">
            <p className="text-lg font-medium">{current.questionText}</p>
            {showAnswer && current.answerText && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{current.answerText}</p>
              </div>
            )}
          </div>
          {!showAnswer ? (
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium"
            >
              Show answer
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={markCorrect}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={markIncorrect}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium"
              >
                Missed it
              </button>
            </div>
          )}
          <p className="text-zinc-500 text-sm mt-2">
            Question {index + 1} of {questions.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
