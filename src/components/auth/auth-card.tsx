"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type Mode = "signin" | "signup";

type FieldErrors = Record<string, string[]>;

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const payload: Record<string, unknown> = {
      username: username.trim(),
      password,
    };

    if (mode === "signup") {
      payload.confirmPassword = confirm;
      if (email.trim()) payload.email = email.trim();
    }

    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/app");
      router.refresh();
      return;
    }

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      issues?: FieldErrors;
    };

    setError(data.error ?? "Something went wrong.");
    if (data.issues) setFieldErrors(data.issues);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-slate-200 backdrop-blur">
      <div className="mb-4 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-semibold">
        {(["signin", "signup"] as Mode[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={clsx(
              "flex-1 rounded-full px-3 py-2 transition",
              mode === tab
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="moviebuff"
            required
          />
          {fieldErrors.username && (
            <p className="text-xs text-rose-600">{fieldErrors.username[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••"
            required
          />
          {fieldErrors.password && (
            <p className="text-xs text-rose-600">{fieldErrors.password[0]}</p>
          )}
          <div className="text-xs text-slate-500">
            {mode === "signin" ? "Forgot password? (coming soon)" : "Use 8+ characters."}
          </div>
        </div>

        {mode === "signup" && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Confirm password</label>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Repeat password"
                required
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-600">{fieldErrors.confirmPassword[0]}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Email <span className="text-slate-400">(optional)</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-600">{fieldErrors.email[0]}</p>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
