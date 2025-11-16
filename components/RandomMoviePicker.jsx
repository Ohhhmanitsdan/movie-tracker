'use client';

import { useState } from 'react';

export default function RandomMoviePicker({ onRefresh }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const pickMovie = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/random');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Nothing to pick');
      }
      setMovie(data.movie);
      if (onRefresh) await onRefresh();
    } catch (error) {
      setMovie(null);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="random-picker">
      <div>
        <h2 style={{ margin: 0 }}>Feeling indecisive?</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Let fate pick the next watch for you.</p>
      </div>
      <button onClick={pickMovie} disabled={loading}>
        {loading ? 'Spinning…' : 'Pick a random movie'}
      </button>
      {movie && (
        <div className="random-result">
          <strong>{movie.title}</strong>
          {movie.releaseDate && <span>({new Date(movie.releaseDate).getFullYear()})</span>}
        </div>
      )}
      {message && <p style={{ color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );
}
