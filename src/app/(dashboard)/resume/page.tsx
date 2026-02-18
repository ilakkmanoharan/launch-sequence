"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Resume = { id: string; title: string; content: string; isDefault: boolean; updatedAt: string };
type Profile = { name?: string | null; email?: string | null; phone?: string | null; summary?: string | null };

export default function ResumePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Profile>({});
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/profile").then((r) => r.json()), fetch("/api/resumes").then((r) => r.json())])
      .then(([p, r]) => {
        setProfile(p ?? null);
        setProfileForm(p ?? {});
        setResumes(Array.isArray(r) ? r : []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      setProfile(data);
      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) return <div className="text-zinc-500">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Resume & Profile</h1>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">Profile</h2>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {editingProfile ? (
            <form onSubmit={saveProfile} className="space-y-3 max-w-md">
              <div>
                <label className="block text-sm text-zinc-500 mb-1">Name</label>
                <input
                  type="text"
                  value={profileForm.name ?? ""}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-500 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email ?? ""}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-500 mb-1">Summary</label>
                <textarea
                  value={profileForm.summary ?? ""}
                  onChange={(e) => setProfileForm((f) => ({ ...f, summary: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium disabled:opacity-50"
                >
                  {savingProfile ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingProfile(false)} className="px-4 py-2 rounded-lg border text-sm">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {profile ? (
                <dl className="grid gap-2 text-sm">
                  {profile.name && (
                    <>
                      <dt className="text-zinc-500">Name</dt>
                      <dd>{profile.name}</dd>
                    </>
                  )}
                  {profile.email && (
                    <>
                      <dt className="text-zinc-500">Email</dt>
                      <dd>{profile.email}</dd>
                    </>
                  )}
                  {profile.summary && (
                    <>
                      <dt className="text-zinc-500">Summary</dt>
                      <dd className="whitespace-pre-wrap">{profile.summary}</dd>
                    </>
                  )}
                  {!profile?.name && !profile?.email && (
                    <p className="text-zinc-500">No profile yet. Click Edit profile to add your info.</p>
                  )}
                </dl>
              ) : (
                <p className="text-zinc-500">No profile yet.</p>
              )}
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
              >
                Edit profile
              </button>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Resumes</h2>
        <ul className="space-y-2">
          {resumes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/resume/${r.id}`}
                className="block p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <span className="font-medium">{r.title}</span>
                {r.isDefault && (
                  <span className="ml-2 text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">Default</span>
                )}
                <span className="text-zinc-500 text-sm ml-2">
                  Updated {new Date(r.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/resume/new"
          className="mt-4 inline-block px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90"
        >
          Add resume
        </Link>
      </section>
    </div>
  );
}
