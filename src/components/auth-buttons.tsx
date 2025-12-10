"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
};

export function LoginForm({ className }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/watchlist");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Login failed. Check your credentials.");
    } catch (err) {
      console.error("Login request failed", err);
      setError("Unable to reach the auth service. Try again.");
    }
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid w-full gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200 ${className ?? ""}`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Username
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="your-username"
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="••••••••"
            required
          />
        </label>
      </div>
      {error ? (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
          {error}
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Sessions last 2 hours and are stored in an HTTP-only cookie.
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export function SignOutButton({ className }: Props) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed", err);
      setSigningOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
    >
      {signingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
