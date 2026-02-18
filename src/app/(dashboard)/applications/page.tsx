"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Position = {
  id: string;
  title: string;
  company: string | null;
  url: string;
  source: string | null;
  status: string;
  requiredInfo: string | null;
  appliedAt: string | null;
  createdAt: string;
};

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mdContent, setMdContent] = useState("");
  const [showSync, setShowSync] = useState(false);

  useEffect(() => {
    const url = statusFilter ? `/api/positions?status=${statusFilter}` : "/api/positions";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setPositions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function handleSyncFromMd() {
    setSyncing(true);
    try {
      const res = await fetch("/api/positions/sync-from-md", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: mdContent ? JSON.stringify({ content: mdContent }) : undefined,
      });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      const ids = (data.results ?? []).map((r: { id: string }) => r.id);
      if (ids.length) {
        const list = await fetch("/api/positions").then((r) => r.json());
        setPositions(Array.isArray(list) ? list : []);
      }
      setShowSync(false);
      setMdContent("");
    } finally {
      setSyncing(false);
    }
  }

  async function handleExportRequiredInfo() {
    try {
      await fetch("/api/positions/export-required-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {
      // ignore
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "applied" ? { appliedAt: new Date().toISOString() } : {}),
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setPositions((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      // ignore
    }
  }

  if (loading) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Applications</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setShowSync((v) => !v)}
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
        >
          Sync from positions.md
        </button>
        <button
          type="button"
          onClick={handleExportRequiredInfo}
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600"
        >
          Export required info to .md
        </button>
      </div>

      {showSync && (
        <div className="mb-6 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 mb-2">
            Paste markdown (## Title at Company followed by URL) or leave empty to read from data/positions.md
          </p>
          <textarea
            value={mdContent}
            onChange={(e) => setMdContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm mb-2"
            placeholder="## Senior Engineer at Acme\nhttps://jobs.acme.com/senior"
          />
          <button
            type="button"
            onClick={handleSyncFromMd}
            disabled={syncing}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      )}

      <ul className="space-y-4">
        {positions.map((p) => (
          <li
            key={p.id}
            className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {p.title}
                  {p.company ? ` at ${p.company}` : ""}
                </a>
                <p className="text-zinc-500 text-sm mt-1">{p.url}</p>
                {p.requiredInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                      Required info
                    </summary>
                    <pre className="mt-1 text-xs whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                      {p.requiredInfo}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    p.status === "applied"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      : p.status === "needs_info"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                        : p.status === "rejected"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {p.status}
                </span>
                <select
                  value={p.status}
                  onChange={(e) => updateStatus(p.id, e.target.value)}
                  className="text-sm px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                >
                  <option value="pending">pending</option>
                  <option value="applied">applied</option>
                  <option value="needs_info">needs_info</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
            </div>
            {p.appliedAt && (
              <p className="text-zinc-500 text-xs mt-2">Applied {new Date(p.appliedAt).toLocaleDateString()}</p>
            )}
          </li>
        ))}
      </ul>
      {positions.length === 0 && (
        <p className="text-zinc-500">
          No positions yet. Add links to data/positions.md and sync, or use the sync form above.
        </p>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500">Loading…</div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
