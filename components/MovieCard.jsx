'use client';

import { useState } from 'react';

const placeholderPoster = 'https://via.placeholder.com/600x900/0f172a/FFFFFF?text=No+Poster';

export default function MovieCard({ movie, position, maxPosition, onChanged, onReorder }) {
  const [busy, setBusy] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);

  const toggleCompleted = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !movie.completed })
      });
      if (!res.ok) throw new Error('Failed to update movie');
      if (onChanged) await onChanged();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const deleteMovie = async () => {
    if (!confirm(`Remove ${movie.title} from the list?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Unable to delete movie');
      if (onChanged) await onChanged();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const rateMovie = async (value) => {
    setRatingBusy(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value })
      });
      if (!res.ok) throw new Error('Unable to save rating');
      if (onChanged) await onChanged();
    } catch (error) {
      console.error(error);
    } finally {
      setRatingBusy(false);
    }
  };

  const truncatedOverview = movie.overview && movie.overview.length > 220
    ? `${movie.overview.slice(0, 220)}…`
    : movie.overview;

  return (
    <div className="movie-card">
      <header>
        <img src={movie.posterUrl || placeholderPoster} alt={movie.title} loading="lazy" />
      </header>
      <div className="content">
        <div>
          <h3 style={{ marginBottom: '0.2rem' }}>{movie.title}</h3>
          {movie.releaseDate && (
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{new Date(movie.releaseDate).getFullYear()}</p>
          )}
        </div>
        {truncatedOverview && <p style={{ margin: 0, color: 'var(--text-muted)' }}>{truncatedOverview}</p>}
        <div className="tags">
          <span className="tag">Priority #{position}</span>
          {movie.completed ? (
            <span className="tag success">Completed</span>
          ) : (
            <span className="tag warning">In queue</span>
          )}
          {movie.averageRating > 0 && <span className="tag">Avg ⭐ {movie.averageRating.toFixed(1)}</span>}
        </div>
        {movie.trailerUrl && (
          <a href={movie.trailerUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            ▶ Watch trailer
          </a>
        )}
        <div>
          <p style={{ margin: '0 0 0.35rem' }}>Your rating</p>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                disabled={ratingBusy}
                onClick={() => rateMovie(value)}
                style={{
                  background: value <= (movie.myRating || 0) ? 'var(--accent)' : 'rgba(255,255,255,0.08)'
                }}
              >
                {value}
              </button>
            ))}
          </div>
          {movie.ratings?.length > 0 && (
            <p style={{ marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {movie.ratings.map((entry) => `${entry.userName}: ${entry.rating}⭐`).join(' • ')}
            </p>
          )}
        </div>
        <div className="movie-actions">
          <button onClick={toggleCompleted} disabled={busy}>
            {movie.completed ? 'Mark un-watched' : 'Mark watched'}
          </button>
          <button className="danger" onClick={deleteMovie} disabled={busy}>
            Delete
          </button>
        </div>
        <div className="priority-controls">
          <button onClick={() => onReorder?.(movie.id, 'up')} disabled={position === 1}>
            ↑
          </button>
          <button onClick={() => onReorder?.(movie.id, 'down')} disabled={position === maxPosition}>
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}
