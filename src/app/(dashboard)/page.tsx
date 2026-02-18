"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    resumes: number;
    keywords: number;
    banks: number;
    questions: number;
    positions: number;
    positionsPending: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/resumes").then((r) => r.json()),
      fetch("/api/keywords").then((r) => r.json()),
      fetch("/api/banks").then((r) => r.json()),
      fetch("/api/positions").then((r) => r.json()),
    ])
      .then(([resumes, keywords, banks, positions]) => {
        const positionsList = Array.isArray(positions) ? positions : [];
        setStats({
          resumes: Array.isArray(resumes) ? resumes.length : 0,
          keywords: Array.isArray(keywords) ? keywords.length : 0,
          banks: Array.isArray(banks) ? banks.length : 0,
          questions: Array.isArray(banks)
            ? banks.reduce((acc: number, b: { _count?: { questions: number } }) => acc + (b._count?.questions ?? 0), 0)
            : 0,
          positions: positionsList.length,
          positionsPending: positionsList.filter((p: { status: string }) => p.status === "pending").length,
        });
      })
      .catch(() => setStats(null));
  }, []);

  const cards = [
    { title: "Resumes", value: stats?.resumes ?? "—", href: "/resume" },
    { title: "Keywords", value: stats?.keywords ?? "—", href: "/keywords" },
    { title: "Question banks", value: stats?.banks ?? "—", href: "/interview" },
    { title: "Questions", value: stats?.questions ?? "—", href: "/interview" },
    { title: "Positions", value: stats?.positions ?? "—", href: "/applications" },
    { title: "Pending applications", value: stats?.positionsPending ?? "—", href: "/applications?status=pending" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="block p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">{c.title}</div>
            <div className="text-2xl font-semibold mt-1">{c.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
