# Watch Buddy

A single-repo Next.js application that lets two friends share a movie backlog, rate what they watch, get TMDb-powered artwork/trailers, pull recommendations based on their ratings, and spin a random pick when nobody can decide.

## Features
- Email/password login for two default users (changeable via SQLite) with secure session cookies.
- Add movies by title – details, posters, trailers, and descriptions are fetched from TMDb automatically.
- Shared prioritized queue with up/down ordering, completion tracking, and per-user + average ratings.
- Smart recommendation shelf sourced from the highest-rated titles on your list.
- Random movie picker to break stalemates.

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables**
   - Copy `.env.local.example` to `.env.local` and add your [`TMDb API key`](https://developer.themoviedb.org/reference/intro/getting-started).
3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` in your browser.

The app stores data in `data/movie-tracker.db` (SQLite). The database file is created automatically; delete it if you want a fresh start.

## Default logins
| Name     | Email                    | Password     |
|----------|--------------------------|--------------|
| Daniel   | `daniel@watchbuddy.dev`  | `watchbuddy1`|
| Co-Pilot | `copilot@watchbuddy.dev` | `watchbuddy2`|

Update or add users directly in the `users` table inside `data/movie-tracker.db` if needed.

## Project structure
```
app/               # Next.js routes (UI + API)
components/        # Client-side React components
lib/               # Database, auth, TMDb helpers
public/            # Static assets
```

## Scripts
- `npm run dev` – start Next.js in dev mode.
- `npm run build` – create an optimized production build.
- `npm run start` – run the production build.
- `npm run lint` – lint with Next.js ESLint config.

## Notes
- Recommendations and metadata rely on TMDb. The API key is required for add/search/recommend flows.
- Sessions last 14 days and are revoked on logout or if the cookie/token pair no longer matches.
