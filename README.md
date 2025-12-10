# Collaborative Watchlist MVP

Modern, collaborative watchlist built with Next.js App Router, TypeScript, Tailwind, MongoDB (Mongoose), iron-session cookies, Zod validation, and OMDb integration.

## Features
- Username/password auth with bcrypt + secure, httpOnly cookies (2h TTL by default).
- Create/join shared watchlists via invite link or join code.
- Add movies/series from OMDb search; auto-fill poster, genres, synopsis.
- Rate 1–5 stars, drag to reorder, filter by type/genre/min rating, and “pick for us” randomizer.
- Invite link generator and join-by-code flow.
- Polished landing hero with tabbed AuthCard and preview panel.

## Getting Started
1) Install dependencies
```bash
npm install
```

2) Copy env vars
```bash
cp .env.local.example .env.local
```
Fill in:
- `MONGODB_URI` – Mongo connection string.
- `OMDB_API_KEY` – OMDb API key.
- `SESSION_PASSWORD` – 32+ char secret for iron-session.
- `SESSION_COOKIE_NAME` (default `watchlist_session`)
- `SESSION_TTL_SECONDS` (default `7200`)

3) Run locally
```bash
npm run dev
```
Open `http://localhost:3000`. Sign up, create/join a watchlist, add items, reorder, rate, and try the random picker.

## Key API Routes
- `POST /api/auth/signup` | `POST /api/auth/login` | `POST /api/auth/logout` | `GET /api/auth/me`
- `GET/POST /api/watchlists` (list/create)
- `POST /api/watchlists/join` (join by code)
- `POST /api/watchlists/[id]/invite` (regenerate invite code)
- `GET /api/watchlists/[id]` (details)
- `GET/POST /api/watchlists/[id]/items` (list/add)
- `PATCH /api/watchlists/[id]/items/[itemId]` (update rating)
- `POST /api/watchlists/[id]/items/reorder` (drag order)
- `GET /api/watchlists/[id]/random` (random pick respecting filters)
- `GET /api/omdb/search` | `GET /api/omdb/details`

All non-auth routes require a valid session cookie. OMDb key stays server-side.
