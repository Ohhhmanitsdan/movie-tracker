import { readDb, mutateDb } from './db.js';

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function buildMovie(movie, viewerId, snapshot) {
  if (!movie) return null;
  const ratings = snapshot.ratings.filter((entry) => entry.movieId === movie.id);
  const averageRating = ratings.length
    ? Number((ratings.reduce((sum, entry) => sum + entry.rating, 0) / ratings.length).toFixed(2))
    : 0;
  const addedBy = snapshot.users.find((user) => user.id === movie.addedBy);
  return {
    id: movie.id,
    tmdbId: movie.tmdbId,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    trailerUrl: movie.trailerUrl,
    releaseDate: movie.releaseDate,
    position: movie.position,
    completed: Boolean(movie.completed),
    completedAt: movie.completedAt,
    addedBy: movie.addedBy,
    addedByName: addedBy?.name ?? 'Friend',
    averageRating,
    myRating: ratings.find((entry) => entry.userId === viewerId)?.rating ?? null,
    ratings: ratings.map((entry) => ({
      userId: entry.userId,
      userName: snapshot.users.find((user) => user.id === entry.userId)?.name ?? 'Friend',
      rating: entry.rating
    }))
  };
}

export function getMoviesForUser(userId) {
  const snapshot = readDb();
  const sorted = [...snapshot.movies].sort((a, b) => {
    if (a.position === b.position) return a.id - b.id;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  return sorted.map((movie) => buildMovie(movie, userId, snapshot));
}

export function getMovieById(movieId, userId) {
  const snapshot = readDb();
  const movie = snapshot.movies.find((entry) => entry.id === movieId);
  return buildMovie(movie, userId, snapshot);
}

export function insertMovie(movieData, userId) {
  if (!movieData?.tmdbId) throw new Error('Missing TMDb data');
  let newMovieId = null;
  mutateDb((draft) => {
    const duplicate = draft.movies.some((movie) => movie.tmdbId === movieData.tmdbId);
    if (duplicate) {
      const error = new Error('Movie already exists in the shared list.');
      error.code = 'MOVIE_EXISTS';
      throw error;
    }
    const maxPosition = draft.movies.reduce((max, movie) => Math.max(max, movie.position ?? 0), 0);
    const now = new Date().toISOString();
    const movie = {
      id: nextId(draft.movies),
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      overview: movieData.overview,
      posterUrl: movieData.posterUrl,
      trailerUrl: movieData.trailerUrl,
      releaseDate: movieData.releaseDate,
      position: maxPosition + 1,
      completed: false,
      completedAt: null,
      addedBy: userId,
      createdAt: now
    };
    draft.movies.push(movie);
    newMovieId = movie.id;
  });
  return getMovieById(newMovieId, userId);
}

export function updateMovie(movieId, updates = {}, userId) {
  let exists = false;
  mutateDb((draft) => {
    const movie = draft.movies.find((entry) => entry.id === movieId);
    if (!movie) return;
    exists = true;
    if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
      movie.completed = Boolean(updates.completed);
      movie.completedAt = updates.completed ? new Date().toISOString() : null;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'position')) {
      movie.position = updates.position;
    }
  });
  if (!exists) return null;
  return getMovieById(movieId, userId);
}

export function deleteMovie(movieId) {
  mutateDb((draft) => {
    draft.movies = draft.movies.filter((movie) => movie.id !== movieId);
    draft.ratings = draft.ratings.filter((rating) => rating.movieId !== movieId);
  });
}

export function saveRating(movieId, userId, rating) {
  if (!movieId || !userId) throw new Error('Missing identifiers');
  let exists = false;
  mutateDb((draft) => {
    const movie = draft.movies.find((entry) => entry.id === movieId);
    if (!movie) return;
    exists = true;
    draft.ratings = draft.ratings.filter((entry) => !(entry.movieId === movieId && entry.userId === userId));
    if (rating != null) {
      const parsed = Math.min(5, Math.max(1, Number(rating)));
      draft.ratings.push({
        id: nextId(draft.ratings),
        movieId,
        userId,
        rating: parsed,
        createdAt: new Date().toISOString()
      });
    }
  });
  if (!exists) return null;
  return getMovieById(movieId, userId);
}

export function reorderMovies(orderedIds = []) {
  if (!orderedIds?.length) return;
  mutateDb((draft) => {
    const knownIds = new Set(draft.movies.map((movie) => movie.id));
    const invalid = orderedIds.some((id) => !knownIds.has(id));
    if (invalid) {
      throw new Error('Reorder request contains unknown movie IDs.');
    }
    orderedIds.forEach((id, index) => {
      const movie = draft.movies.find((entry) => entry.id === id);
      if (movie) {
        movie.position = index + 1;
      }
    });
  });
}

export function getTrackedTmdbIds() {
  const snapshot = readDb();
  return snapshot.movies.map((movie) => movie.tmdbId);
}

export function getTopRatedTmdbSeeds(limit = 3) {
  const snapshot = readDb();
  const rated = snapshot.movies
    .map((movie) => {
      const ratings = snapshot.ratings.filter((entry) => entry.movieId === movie.id);
      if (!ratings.length) return null;
      const avg = ratings.reduce((sum, entry) => sum + entry.rating, 0) / ratings.length;
      return { tmdbId: movie.tmdbId, avg, position: movie.position ?? 0 };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.avg === a.avg) return a.position - b.position;
      return b.avg - a.avg;
    })
    .slice(0, limit)
    .map((entry) => entry.tmdbId);

  if (rated.length) return rated;

  return snapshot.movies
    .filter((movie) => !movie.completed)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .slice(0, limit)
    .map((movie) => movie.tmdbId);
}

export function getRandomPendingMovie(userId) {
  const snapshot = readDb();
  const pending = snapshot.movies.filter((movie) => !movie.completed);
  if (!pending.length) return null;
  const chosen = pending[Math.floor(Math.random() * pending.length)];
  return buildMovie(chosen, userId, snapshot);
}
