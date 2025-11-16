import db from './db.js';

function decorateMovies(rows) {
  if (!rows?.length) return [];
  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(',');
  let ratingsMap = {};
  if (ids.length) {
    const ratingRows = db
      .prepare(
        `SELECT mr.movie_id as movieId, mr.user_id as userId, mr.rating, u.name as userName
         FROM movie_ratings mr
         JOIN users u ON u.id = mr.user_id
         WHERE mr.movie_id IN (${placeholders})`
      )
      .all(...ids);
    ratingsMap = ratingRows.reduce((acc, current) => {
      if (!acc[current.movieId]) acc[current.movieId] = [];
      acc[current.movieId].push({
        userId: current.userId,
        userName: current.userName,
        rating: current.rating
      });
      return acc;
    }, {});
  }

  return rows.map((row) => ({
    id: row.id,
    tmdbId: row.tmdbId,
    title: row.title,
    overview: row.overview,
    posterUrl: row.posterUrl,
    trailerUrl: row.trailerUrl,
    releaseDate: row.releaseDate,
    position: row.position,
    completed: Boolean(row.completed),
    completedAt: row.completedAt,
    addedBy: row.addedBy,
    addedByName: row.addedByName,
    averageRating: row.averageRating ? Number(row.averageRating) : 0,
    myRating: row.viewerRating != null ? Number(row.viewerRating) : null,
    ratings: ratingsMap[row.id] ?? []
  }));
}

export function getMoviesForUser(userId) {
  const rows = db
    .prepare(
      `SELECT m.id,
              m.tmdb_id as tmdbId,
              m.title,
              m.overview,
              m.poster_url as posterUrl,
              m.trailer_url as trailerUrl,
              m.release_date as releaseDate,
              m.position,
              m.completed,
              m.completed_at as completedAt,
              m.added_by as addedBy,
              added.name as addedByName,
              ROUND(COALESCE(AVG(r.rating), 0), 2) as averageRating,
              (
                SELECT rating
                FROM movie_ratings mr
                WHERE mr.movie_id = m.id AND mr.user_id = @userId
              ) as viewerRating
       FROM movies m
       LEFT JOIN users added ON added.id = m.added_by
       LEFT JOIN movie_ratings r ON r.movie_id = m.id
       GROUP BY m.id
       ORDER BY m.position ASC, m.id ASC`
    )
    .all({ userId });
  return decorateMovies(rows);
}

export function getMovieById(movieId, userId) {
  const row = db
    .prepare(
      `SELECT m.id,
              m.tmdb_id as tmdbId,
              m.title,
              m.overview,
              m.poster_url as posterUrl,
              m.trailer_url as trailerUrl,
              m.release_date as releaseDate,
              m.position,
              m.completed,
              m.completed_at as completedAt,
              m.added_by as addedBy,
              added.name as addedByName,
              ROUND(COALESCE(AVG(r.rating), 0), 2) as averageRating,
              (
                SELECT rating
                FROM movie_ratings mr
                WHERE mr.movie_id = m.id AND mr.user_id = @userId
              ) as viewerRating
       FROM movies m
       LEFT JOIN users added ON added.id = m.added_by
       LEFT JOIN movie_ratings r ON r.movie_id = m.id
       WHERE m.id = @movieId
       GROUP BY m.id`
    )
    .get({ movieId, userId });
  if (!row) return null;
  return decorateMovies([row])[0];
}

export function insertMovie(movieData, userId) {
  if (!movieData?.tmdbId) throw new Error('Missing TMDb data');
  const exists = db.prepare('SELECT id FROM movies WHERE tmdb_id = ?').get(movieData.tmdbId);
  if (exists) {
    const error = new Error('Movie already exists in the shared list.');
    error.code = 'MOVIE_EXISTS';
    throw error;
  }

  const maxPositionRow = db.prepare('SELECT COALESCE(MAX(position), 0) as maxPosition FROM movies').get();
  const nextPosition = (maxPositionRow?.maxPosition ?? 0) + 1;
  const insert = db.prepare(
    `INSERT INTO movies (tmdb_id, title, overview, poster_url, trailer_url, release_date, position, added_by)
     VALUES (@tmdbId, @title, @overview, @posterUrl, @trailerUrl, @releaseDate, @position, @addedBy)`
  );
  const result = insert.run({
    tmdbId: movieData.tmdbId,
    title: movieData.title,
    overview: movieData.overview,
    posterUrl: movieData.posterUrl,
    trailerUrl: movieData.trailerUrl,
    releaseDate: movieData.releaseDate,
    position: nextPosition,
    addedBy: userId
  });
  return getMovieById(result.lastInsertRowid, userId);
}

export function updateMovie(movieId, updates = {}, userId) {
  if (!movieId) return null;
  if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
    const completed = updates.completed ? 1 : 0;
    const completedAt = updates.completed ? new Date().toISOString() : null;
    db.prepare('UPDATE movies SET completed = ?, completed_at = ? WHERE id = ?').run(completed, completedAt, movieId);
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'position')) {
    db.prepare('UPDATE movies SET position = ? WHERE id = ?').run(updates.position, movieId);
  }
  return getMovieById(movieId, userId);
}

export function deleteMovie(movieId) {
  db.prepare('DELETE FROM movies WHERE id = ?').run(movieId);
}

export function saveRating(movieId, userId, rating) {
  if (!movieId || !userId) throw new Error('Missing identifiers');
  if (rating == null) {
    db.prepare('DELETE FROM movie_ratings WHERE movie_id = ? AND user_id = ?').run(movieId, userId);
  } else {
    const parsed = Math.min(5, Math.max(1, Number(rating)));
    db.prepare(
      `INSERT INTO movie_ratings (movie_id, user_id, rating)
       VALUES (?, ?, ?)
       ON CONFLICT(movie_id, user_id) DO UPDATE SET rating = excluded.rating`
    ).run(movieId, userId, parsed);
  }
  return getMovieById(movieId, userId);
}

export function reorderMovies(orderedIds = []) {
  if (!orderedIds?.length) return;
  const rows = db.prepare('SELECT id FROM movies').all();
  const knownIds = new Set(rows.map((row) => row.id));
  const invalid = orderedIds.some((id) => !knownIds.has(id));
  if (invalid) {
    throw new Error('Reorder request contains unknown movie IDs.');
  }
  const tx = db.transaction((ids) => {
    ids.forEach((id, index) => {
      db.prepare('UPDATE movies SET position = ? WHERE id = ?').run(index + 1, id);
    });
  });
  tx(orderedIds);
}

export function getTrackedTmdbIds() {
  return db.prepare('SELECT tmdb_id as tmdbId FROM movies').all().map((row) => row.tmdbId);
}

export function getTopRatedTmdbSeeds(limit = 3) {
  const rows = db
    .prepare(
      `SELECT m.tmdb_id as tmdbId
       FROM movies m
       JOIN movie_ratings r ON r.movie_id = m.id
       GROUP BY m.id
       ORDER BY AVG(r.rating) DESC, m.position ASC
       LIMIT ?`
    )
    .all(limit);
  if (rows.length) return rows.map((row) => row.tmdbId);
  const fallback = db
    .prepare(
      `SELECT tmdb_id as tmdbId
       FROM movies
       WHERE completed = 0
       ORDER BY position ASC
       LIMIT ?`
    )
    .all(limit);
  return fallback.map((row) => row.tmdbId);
}

export function getRandomPendingMovie(userId) {
  const row = db
    .prepare(
      `SELECT m.id,
              m.tmdb_id as tmdbId,
              m.title,
              m.overview,
              m.poster_url as posterUrl,
              m.trailer_url as trailerUrl,
              m.release_date as releaseDate,
              m.position,
              m.completed,
              m.completed_at as completedAt,
              m.added_by as addedBy,
              added.name as addedByName,
              ROUND(COALESCE(AVG(r.rating), 0), 2) as averageRating,
              (
                SELECT rating
                FROM movie_ratings mr
                WHERE mr.movie_id = m.id AND mr.user_id = @userId
              ) as viewerRating
       FROM movies m
       LEFT JOIN users added ON added.id = m.added_by
       LEFT JOIN movie_ratings r ON r.movie_id = m.id
       WHERE m.completed = 0
       ORDER BY RANDOM()
       LIMIT 1`
    )
    .get({ userId });
  if (!row) return null;
  return decorateMovies([row])[0];
}
