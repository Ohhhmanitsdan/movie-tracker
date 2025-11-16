'use client';

export default function RecommendationsPanel({ data = [], loading, onRefresh }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Smart recommendations</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Based on the movies you rated ⭐️ high.
          </p>
        </div>
        <button className="secondary" onClick={() => onRefresh?.()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh' }
        </button>
      </div>
      {data.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '1rem' }}>
          Rate a couple of movies to unlock personalized picks.
        </div>
      ) : (
        <div className="recommendations-grid">
          {data.map((item) => (
            <article key={item.tmdbId} className="recommendation-card">
              <h4>{item.title}</h4>
              {item.releaseDate && (
                <p style={{ marginBottom: '0.2rem' }}>{new Date(item.releaseDate).getFullYear()}</p>
              )}
              {item.overview && <p>{item.overview.slice(0, 140)}{item.overview.length > 140 ? '…' : ''}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
