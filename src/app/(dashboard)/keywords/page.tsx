"use client";

import { useEffect, useState } from "react";

type Keyword = { id: string; value: string; category: string | null };

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/keywords")
      .then((r) => r.json())
      .then((data) => setKeywords(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: value.trim(), category: category.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      setKeywords((prev) => [...prev, created].sort((a, b) => a.value.localeCompare(b.value)));
      setValue("");
      setCategory("");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/keywords/${id}`, { method: "DELETE" });
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch {
      // ignore
    }
  }

  const byCategory = keywords.reduce<Record<string, Keyword[]>>((acc, k) => {
    const cat = k.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(k);
    return acc;
  }, {});

  if (loading) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Keywords</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-8">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Keyword or phrase"
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 min-w-[200px]"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g. skills)"
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 min-w-[120px]"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </form>

      <div className="space-y-6">
        {Object.entries(byCategory).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">{cat}</h2>
            <ul className="flex flex-wrap gap-2">
              {list.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <span>{k.value}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(k.id)}
                    className="text-zinc-400 hover:text-red-500 text-sm"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {keywords.length === 0 && (
        <p className="text-zinc-500">No keywords yet. Add phrases for ATS and job descriptions.</p>
      )}
    </div>
  );
}
