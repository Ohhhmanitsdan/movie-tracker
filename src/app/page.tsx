import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { WatchlistPreviewCard } from "@/components/landing/watchlist-preview-card";
import { getCurrentUser } from "@/lib/auth";

const benefits = [
  "Auto-fill posters, genres, synopsis",
  "Star ratings for vibe checks",
  "Drag to prioritize",
  "Random pick for indecision",
  "Invite with a link",
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text2)] ring-1 ring-[var(--elevated)]">
          Collaborative Watchlist
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
          Plan your next movie night together.
        </h1>
        <p className="mt-4 text-lg text-[var(--text2)]">
          A shared watchlist that stays in sync—auto-filled info, drag-to-rank, and a one-click
          “Pick for us” when you can&apos;t decide.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a className="btn btn-primary" href="#auth-card">
            Create a list
          </a>
          <a className="btn btn-ghost" href="#benefits">
            How it works
          </a>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
        <div id="auth-card">
          <AuthCard />
        </div>
        <WatchlistPreviewCard />
      </div>

      <section id="benefits" className="mt-10">
        <ul className="grid gap-3 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="card flex items-center gap-3 text-sm text-[var(--text)]"
            >
              <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-glow)] text-[var(--primary)]">
                ✓
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
