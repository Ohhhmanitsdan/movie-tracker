import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-buttons";
import { getSessionFromCookies } from "@/lib/auth";

const features = [
  "Auto-fill titles with OMDB posters, genres, and synopsis.",
  "Drag-and-drop to prioritize what to watch next.",
  "Rate with skulls, filter by mood, and pick a random suggestion.",
  "One private list for the two of you—no invites needed.",
];

export default async function Home() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect("/watchlist");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
      <div className="relative w-full overflow-hidden rounded-3xl bg-white p-10 shadow-2xl ring-1 ring-slate-100 lg:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
              Collaborative Watchlist
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Plan the next movie night—together.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-slate-600">
                Keep a single shared watchlist for movies and shows, auto-fill details from OMDB, and
                let the app pick something when you can&apos;t decide.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Sign in with your shared credentials
              </p>
              <LoginForm />
              <p className="text-xs text-slate-500">
                Passwords stay server-side; sessions use a 2h HTTP-only, SameSite=None cookie.
              </p>
            </div>
            <ul className="grid gap-3 rounded-2xl bg-white/60 p-4 ring-1 ring-slate-100 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-xl p-2 text-sm text-slate-700"
                >
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-indigo-200">Preview</p>
                <p className="text-lg font-semibold">Shared watchlist</p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
                Live sync
              </div>
            </div>
            <div className="space-y-4">
              {["Dune: Part Two", "The Bear S03", "Everything Everywhere"].map((title, idx) => (
                <div
                  key={title}
                  className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-indigo-100">
                      {idx === 0 ? "Movie · Sci-Fi · 2024" : idx === 1 ? "TV · Dramedy" : "Movie · Adventure"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-300">
                    {"💀".repeat(5 - idx)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-sm text-indigo-100 ring-1 ring-white/10">
              <p className="font-semibold text-white">“Pick something for us”</p>
              <p>Let the app suggest a title that matches your filters.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
