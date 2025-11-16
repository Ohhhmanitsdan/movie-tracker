'use client';

import { useState } from 'react';

export default function AddMovieForm({ onAdded }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to add movie');
      }
      setTitle('');
      setStatus(`Added ${data.movie?.title || 'the movie'}!`);
      if (onAdded) await onAdded();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
      <label htmlFor="movie-title">Add a movie</label>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          id="movie-title"
          type="text"
          value={title}
          placeholder="Search TMDb by movie title"
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, minWidth: '240px' }}
        />
        <button type="submit" disabled={loading} style={{ minWidth: '140px' }}>
          {loading ? 'Searching…' : 'Add to list'}
        </button>
      </div>
      {status && <p style={{ margin: 0, color: status.startsWith('Added') ? 'var(--green)' : 'var(--red)' }}>{status}</p>}
    </form>
  );
}
