'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const defaultCreds = {
  email: 'daniel@watchbuddy.dev',
  password: 'watchbuddy1'
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(defaultCreds.email);
  const [password, setPassword] = useState(defaultCreds.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unable to login' }));
        throw new Error(data.error || 'Unable to sign in');
      }
      router.push('/watchlist');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel login-panel">
      <h1>🎥 Watch Buddy</h1>
      <p>Sign in to manage the shared movie backlog.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••"
            required
          />
        </div>
        {error && <p style={{ color: 'var(--red)', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Try either account:<br />
        <strong>daniel@watchbuddy.dev</strong> / <code>watchbuddy1</code><br />
        <strong>copilot@watchbuddy.dev</strong> / <code>watchbuddy2</code>
      </p>
    </div>
  );
}
