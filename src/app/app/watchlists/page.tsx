import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { joinWatchlistByCode, listWatchlists } from "@/lib/watchlists";
import { WatchlistList } from "@/components/watchlists/watchlist-list";

type Props = { searchParams: { code?: string } };

export default async function WatchlistsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  if (searchParams.code) {
    await joinWatchlistByCode(user.id, searchParams.code);
  }

  const watchlists = await listWatchlists(user.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8 lg:py-12">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Your watchlists
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Collaborative Watchlists</h1>
          <p className="text-sm text-slate-600">Signed in as {user.username}</p>
        </div>
      </header>

      <WatchlistList initialWatchlists={watchlists} />
    </main>
  );
}
