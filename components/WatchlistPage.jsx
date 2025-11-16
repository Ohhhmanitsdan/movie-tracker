'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import AddMovieForm from './AddMovieForm.jsx';
import MovieCard from './MovieCard.jsx';
import RecommendationsPanel from './RecommendationsPanel.jsx';
import RandomMoviePicker from './RandomMoviePicker.jsx';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || 'Request failed');
  }
  return res.json();
};

export default function WatchlistPage({ user }) {
  const moviesQuery = useSWR('/api/movies', fetcher);
  const recommendationsQuery = useSWR('/api/recommendations', fetcher, {
    revalidateOnFocus: false
  });

  const movies = moviesQuery.data?.movies ?? [];
  const stats = useMemo(() => {
    const completed = movies.filter((movie) => movie.completed).length;
    const pending = movies.length - completed;
    return { total: movies.length, completed, pending };
  }, [movies]);

  const refreshAll = async () => {
    await Promise.all([moviesQuery.mutate(), recommendationsQuery.mutate()]);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleReorder = async (movieId, direction) => {
    const current = [...movies];
    const index = current.findIndex((movie) => movie.id === movieId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= current.length) return;
    [current[index], current[swapIndex]] = [current[swapIndex], current[index]];
    moviesQuery.mutate({ movies: current }, false);
    try {
      await fetch('/api/movies/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: current.map((movie) => movie.id) })
      });
    } finally {
      await refreshAll();
    }
  };

  return (
    <div className="app-shell">
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>🍿 Watch Buddy</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Shared movie queue for {user.name} + friend.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
          <button className="secondary" style={{ marginTop: '0.4rem' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="panel" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Stat label="Movies" value={stats.total} />
          <Stat label="Queued" value={stats.pending} />
          <Stat label="Completed" value={stats.completed} />
        </div>
        <AddMovieForm onAdded={refreshAll} />
      </div>

      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Shared watchlist</h2>
          {moviesQuery.isLoading && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Syncing…</span>}
        </div>
        {movies.length === 0 ? (
          <div className="empty-state">Add your first movie to kick things off.</div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                position={index + 1}
                maxPosition={movies.length}
                onChanged={refreshAll}
                onReorder={handleReorder}
              />
            ))}
          </div>
        )}
      </section>

      <div className="panel" style={{ display: 'grid', gap: '1.5rem' }}>
        <RandomMoviePicker onRefresh={refreshAll} />
        <RecommendationsPanel
          data={recommendationsQuery.data?.recommendations ?? []}
          loading={recommendationsQuery.isLoading}
          onRefresh={recommendationsQuery.mutate}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</p>
      <strong style={{ fontSize: '1.8rem' }}>{value}</strong>
    </div>
  );
}
