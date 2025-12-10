import { redirect } from "next/navigation";
import WatchlistClient from "@/components/watchlist/watchlist-client";
import { getSessionFromCookies } from "@/lib/auth";
import { getWatchItems } from "@/lib/watch-items";

export default async function WatchlistPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const items = await getWatchItems();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8 sm:py-12">
      <WatchlistClient
        initialItems={items}
        username={session.username}
      />
    </main>
  );
}
