import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/auth.js';
import LoginForm from '@/components/LoginForm.jsx';

export default function HomePage() {
  const user = getUserFromCookies();
  if (user) {
    redirect('/watchlist');
  }
  return (
    <main className="app-shell" style={{ display: 'flex', justifyContent: 'center' }}>
      <LoginForm />
    </main>
  );
}
