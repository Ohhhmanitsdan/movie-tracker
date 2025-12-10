# Watchlist for Two

A private, shared watchlist for two friends to track movies and TV shows. Built with Next.js App Router, TypeScript, Tailwind, MongoDB, NextAuth, and OMDB for metadata.

## Features
- Google sign-in with NextAuth; every authenticated user sees the same shared list.
- OMDB-powered search to auto-fill poster, synopsis, year, and genres (trailers not available in OMDB).
- Drag-and-drop custom ordering that persists.
- Skull ratings, status tracking, notes, filters, sorting, and a random picker that respects filters.
- Vercel-ready configuration with remote image domains and server-side OMDB proxy routes.

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Copy environment variables
```bash
cp .env.local.example .env.local
```
Fill the values:
- `MONGODB_URI`: MongoDB Atlas connection string.
- `NEXTAUTH_SECRET`: Any strong secret (use `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Usually `http://localhost:3000` in development.
- `OMDB_API_KEY`: OMDB API key.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: From Google Cloud OAuth credentials (Authorized redirect: `http://localhost:3000/api/auth/callback/google`).

3) Run the dev server
```bash
npm run dev
```
Open `http://localhost:3000` and sign in with Google.

## API Routes (App Router)
- `GET /api/omdb/search?query=&type=movie|tv|multi`
- `GET /api/omdb/details?imdbId=&type=movie|tv`
- `GET /api/watch-items` – fetch list
- `POST /api/watch-items` – create item from OMDB details
- `PATCH /api/watch-items/:id` – update status/rating/notes
- `POST /api/watch-items/reorder` – persist drag order

All routes require authentication; the OMDB key stays server-side.

## Deploying to Vercel
1. Push to a Git repo.
2. Create a new Vercel project from the repo.
3. Add the same environment variables in Vercel.
4. Set `NEXTAUTH_URL` to your Vercel domain.

## Notes
- Custom drag order is available when filters are cleared and “Custom order” sorting is selected.
- Order indices are renumbered on each drop for stability (0, 10, 20, ...).
- MongoDB adapter is used for NextAuth sessions and user data.
