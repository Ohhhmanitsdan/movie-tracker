"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WatchlistSummary } from "@/lib/types";

type Props = {
  initialWatchlists: WatchlistSummary[];
};

export function WatchlistList({ initialWatchlists }: Props) {
  const router = useRouter();
  const [watchlists, setWatchlists] = useState(initialWatchlists);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/watchlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setWatchlists((prev) => [...prev, data.watchlist]);
      setName("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create watchlist.");
    }
    setCreating(false);
  };

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setJoining(true);
    const res = await fetch("/api/watchlists/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      const data = await res.json();
      setWatchlists((prev) => {
        const exists = prev.some((w) => w.id === data.watchlist.id);
        return exists ? prev : [...prev, data.watchlist];
      });
      setCode("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not join watchlist.");
    }
    setJoining(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
        <form className="space-y-2" onSubmit={handleCreate}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Create a watchlist</h3>
            <span className="text-xs text-slate-500">Flow A</span>
          </div>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Friday Night Picks"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            You&apos;ll get an invite link and join code to share.
          </p>
        </form>
        <form className="space-y-2" onSubmit={handleJoin}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Join with a code</h3>
            <span className="text-xs text-slate-500">Flow B</span>
          </div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Invite code"
              required
            />
            <button
              type="submit"
              disabled={joining}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Paste the join code or invite link token shared with you.
          </p>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {watchlists.map((watchlist) => (
          <button
            key={watchlist.id}
            onClick={() => router.push(`/app/watchlists/${watchlist.id}`)}
            className="flex flex-col items-start gap-2 rounded-2xl bg-white/80 p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {watchlist.visibility === "link" ? "Link invite" : "Private"}
              </div>
              <span className="text-xs text-slate-500">
                {new Date(watchlist.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{watchlist.name}</h3>
            <p className="text-sm text-slate-600">
              {watchlist.memberCount} {watchlist.memberCount === 1 ? "member" : "members"} • Invite
              code: <span className="font-mono text-slate-800">{watchlist.inviteCode}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                Open watchlist
              </span>
            </div>
          </button>
        ))}
      </div>

      {watchlists.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-slate-600">
          No watchlists yet. Create one or join with a code to get started.
        </div>
      )}
    </div>
  );
}
