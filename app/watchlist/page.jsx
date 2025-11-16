import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/auth.js';
import WatchlistPage from '@/components/WatchlistPage.jsx';

export default function WatchlistRoute() {
  const user = getUserFromCookies();
  if (!user) {
    redirect('/');
  }
  return <WatchlistPage user={user} />;
}
