import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listItems } from "@/lib/watch-items";
import { getWatchlistForUser, joinWatchlistByCode } from "@/lib/watchlists";
import { WatchlistDetailClient } from "@/components/watchlists/watchlist-detail-client";

type Params = { params: { id: string }; searchParams: { code?: string } };

export default async function WatchlistDetailPage({ params, searchParams }: Params) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (searchParams.code) {
    await joinWatchlistByCode(user.id, searchParams.code);
  }
  const watchlist = await getWatchlistForUser(params.id, user.id);
  if (!watchlist) redirect("/app/watchlists");
  const items = await listItems(params.id, user.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8 lg:py-12">
      <WatchlistDetailClient watchlist={watchlist} initialItems={items ?? []} />
    </main>
  );
}
