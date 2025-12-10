"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = Record<string, string[]>;

export function LandingAuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
    <div className="w-full max-w-lg card">
      <div className="mb-4 flex gap-2 rounded-full bg-[var(--surface)] p-1 text-sm font-semibold">
        {(["signin", "signup"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`flex-1 rounded-full px-3 py-2 transition ${
              mode === tab
                ? "bg-[var(--elevated)] shadow-sm text-[var(--text)]"
                : "text-[var(--text2)] hover:text-[var(--text)]"
            }`}
          >
            {tab === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[var(--text)]">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="modern"
            placeholder="moviebuff"
            required
          />
          {fieldErrors.username && (
            <p className="text-xs text-[var(--danger)]">{fieldErrors.username[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[var(--text)]">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs font-medium text-[var(--primary)] hover:text-[var(--text)]"
            >
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="modern"
            placeholder="••••••••"
            required
          />
          {fieldErrors.password && (
            <p className="text-xs text-[var(--danger)]">{fieldErrors.password[0]}</p>
          )}
        </div>

        {mode === "signup" && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--text)]">Confirm password</label>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="modern"
                placeholder="Repeat password"
                required
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-[var(--danger)]">{fieldErrors.confirmPassword[0]}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[var(--text)]">
                Email <span className="text-[var(--text2)]">(optional)</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="modern"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-[var(--danger)]">{fieldErrors.email[0]}</p>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/40">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
