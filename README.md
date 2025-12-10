# Watchlist for Two

A private, shared watchlist for two friends to track movies and TV shows. Built with Next.js App Router, TypeScript, Tailwind, MongoDB, and OMDB for metadata.

## Features
- Username/password login that issues a 2h JWT session in an HTTP-only, SameSite=None cookie (`epsilon_session` by default).
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
- `OMDB_API_KEY`: OMDB API key.
- `JWT_SECRET`: Strong secret used to sign JWT sessions (e.g. `openssl rand -base64 32`).
- `AUTH_USERNAME`: Username that can sign in.
- `AUTH_PASSWORD_HASH`: Bcrypt hash for the password (generate with `node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"`).
- `AUTH_ROLE`: `admin` or `user` (default `admin`), `AUTH_SESSION_VERSION` (bump to force logouts), `AUTH_SECRET_CLEARANCE` (optional flag), `AUTH_STATUS` (`active` or `disabled`).
- `SESSION_COOKIE_NAME` and `SESSION_TTL_SECONDS` (optional overrides; default cookie name is `epsilon_session`, TTL is 7200s).
- `DEV_FAKE_SESSION`: Set to `true` in development to bypass auth with a fake admin session (`DEV_FAKE_USERNAME` optional).

3) Run the dev server
```bash
npm run dev
```
Open `http://localhost:3000` and sign in with your username/password.

## API Routes (App Router)
- `POST /api/auth/login` – exchange username/password for a session cookie
- `GET /api/auth/session` – return the current session payload
- `POST /api/auth/logout` – clear the session cookie
- `GET /api/omdb/search?query=&type=movie|tv|multi`
- `GET /api/omdb/details?imdbId=&type=movie|tv`
- `GET /api/watch-items` – fetch list
- `POST /api/watch-items` – create item from OMDB details
- `PATCH /api/watch-items/:id` – update status/rating/notes
- `POST /api/watch-items/reorder` – persist drag order

All routes require the session cookie; the OMDB key stays server-side.

## Deploying to Vercel
1. Push to a Git repo.
2. Create a new Vercel project from the repo.
3. Add the same environment variables in Vercel.

## Notes
- Custom drag order is available when filters are cleared and “Custom order” sorting is selected.
- Order indices are renumbered on each drop for stability (0, 10, 20, ...).
- Sessions are httpOnly/secure (except for dev) and refresh automatically when user details change.
- In development the cookie uses `SameSite=Lax` with `secure=false` so it works over `http://localhost`; production uses `SameSite=None` + `Secure`.
