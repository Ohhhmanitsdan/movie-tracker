import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'movie-tracker.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      overview TEXT,
      poster_url TEXT,
      trailer_url TEXT,
      release_date TEXT,
      position INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      added_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(added_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS movie_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(movie_id, user_id),
      FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_movies_position ON movies(position);
    CREATE INDEX IF NOT EXISTS idx_ratings_movie ON movie_ratings(movie_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  seedDefaultUsers();
}

function seedDefaultUsers() {
  const defaults = [
    { name: 'Daniel', email: 'daniel@watchbuddy.dev', password: 'watchbuddy1' },
    { name: 'Co-Pilot', email: 'copilot@watchbuddy.dev', password: 'watchbuddy2' }
  ];

  const insert = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
  defaults.forEach((user) => {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
    if (!exists) {
      const hash = bcrypt.hashSync(user.password, 10);
      insert.run(user.name, user.email, hash);
    }
  });
}

init();

export default db;
