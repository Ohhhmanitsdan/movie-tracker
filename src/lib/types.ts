export type MediaType = "movie" | "tv";

export type WatchStatus = "want_to_watch" | "watching" | "watched";

export type WatchItem = {
  id: string;
  tmdbId: string;
  type: MediaType;
  title: string;
  posterUrl: string | null;
  overview: string | null;
  trailerUrl: string | null;
  year: number | null;
  genres: string[];
  status: WatchStatus;
  ratingSkulls: number | null;
  notes: string | null;
  orderIndex: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TMDBSearchResult = {
  tmdbId: string;
  type: MediaType;
  title: string;
  overview: string | null;
  year: number | null;
  posterUrl: string | null;
};

export type TMDBDetails = TMDBSearchResult & {
  genres: string[];
  trailerUrl: string | null;
};
