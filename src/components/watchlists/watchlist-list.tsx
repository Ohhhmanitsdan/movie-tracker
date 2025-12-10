"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WatchlistSummary } from "@/lib/types";

type Props = {
  initialWatchlists: WatchlistSummary[];
  username?: string;
};

export function WatchlistList({ initialWatchlists, username }: Props) {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text2)]">
            Your watchlists
          </p>
          <h2 className="text-2xl font-bold text-[var(--text)]">Welcome back{username ? `, ${username}` : ""}</h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--text2)]">
          <div className="rounded-full bg-[var(--elevated)] px-3 py-1">
            {watchlists.length} {watchlists.length === 1 ? "list" : "lists"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text2)]">Flow A</p>
              <h3 className="text-lg font-semibold text-[var(--text)]">Create a watchlist</h3>
              <p className="text-sm text-[var(--text2)]">
                Name your list and we&apos;ll generate an invite link and code.
              </p>
            </div>
          </div>
          <form className="space-y-3" onSubmit={handleCreate}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="modern w-full"
              placeholder="Friday Night Picks"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary w-full"
            >
              {creating ? "Creating..." : "Create watchlist"}
            </button>
          </form>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text2)]">Flow B</p>
              <h3 className="text-lg font-semibold text-[var(--text)]">Join with a code</h3>
              <p className="text-sm text-[var(--text2)]">
                Paste the join code or token shared with you.
              </p>
            </div>
          </div>
          <form className="space-y-3" onSubmit={handleJoin}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="modern w-full"
              placeholder="Invite code"
              required
            />
            <button
              type="submit"
              disabled={joining}
              className="btn btn-ghost w-full"
            >
              {joining ? "Joining..." : "Join watchlist"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-[var(--elevated)] px-4 py-3 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/30">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {watchlists.map((watchlist) => (
          <div key={watchlist.id} className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                {watchlist.visibility === "link" ? "Link invite" : "Private"}
              </div>
              <span className="text-xs text-[var(--text2)]">
                {new Date(watchlist.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">{watchlist.name}</h3>
              <p className="text-sm text-[var(--text2)]">
                {watchlist.memberCount} {watchlist.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--elevated)] px-3 py-2 text-xs text-[var(--text2)] flex items-center justify-between gap-2 font-mono">
              <span className="truncate">{watchlist.inviteCode}</span>
              <button
                type="button"
                className="text-[var(--primary)] hover:text-[var(--text)]"
                onClick={() => navigator.clipboard.writeText(watchlist.inviteCode)}
              >
                Copy
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push(`/app/watchlists/${watchlist.id}`)}
                className="btn btn-primary w-full"
              >
                Open
              </button>
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/app/watchlists/${watchlist.id}?code=${watchlist.inviteCode}`,
                  )
                }
              >
                Copy link
              </button>
            </div>
          </div>
        ))}
      </div>

      {watchlists.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[var(--elevated)] bg-[var(--surface)] p-8 text-center text-[var(--text2)]">
          No watchlists yet. Create one or join with a code to get started.
        </div>
      )}
    </div>
  );
}
