export type SessionUser = {
  id: string;
  username: string;
  email?: string;
};

export type MediaType = "movie" | "series";

export type WatchlistSummary = {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
  visibility: "private" | "link";
  inviteCode: string;
  createdAt: string;
};

export type WatchItem = {
  id: string;
  watchlistId: string;
  title: string;
  type: MediaType;
  status: "queue" | "watching" | "watched";
  year: number | null;
  poster: string | null;
  genre: string[];
  synopsis: string | null;
  omdbId: string | null;
  runtime: string | null;
  addedBy: string;
  starRating: number | null;
  orderIndex: number;
  createdAt: string;
};

export type SearchResult = {
  imdbId: string;
  type: MediaType;
  title: string;
  overview: string | null;
  year: number | null;
  posterUrl: string | null;
};

export type MediaDetails = SearchResult & {
  genres: string[];
  trailerUrl: string | null;
};
