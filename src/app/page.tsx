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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-4xl bg-white/80 p-8 shadow-2xl ring-1 ring-slate-200 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
              Collaborative Watchlist
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Plan the next movie night together.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-600">
                A shared list for movies and shows with auto-filled details, star ratings,
                drag-to-prioritize, and a “pick for us” button when you can&apos;t decide.
              </p>
            </div>
            <AuthCard />
            <ul className="grid gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-100 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-xl p-2 text-sm text-slate-700"
                >
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <WatchlistPreviewCard />
        </div>
      </div>
    </main>
  );
}
