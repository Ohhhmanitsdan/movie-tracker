import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import WatchlistClient from "@/components/watchlist/watchlist-client";
import { authOptions } from "@/lib/auth";
import { getWatchItems } from "@/lib/watch-items";

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const items = await getWatchItems();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8 sm:py-12">
      <WatchlistClient
        initialItems={items}
        userEmail={session.user?.email ?? "you"}
      />
    </main>
  );
}
