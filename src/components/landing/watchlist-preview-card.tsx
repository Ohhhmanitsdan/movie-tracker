const sampleItems = [
  { title: "The Last Horizon", meta: "Movie · Sci-Fi · 2024", rating: 5 },
  { title: "Signal // Season 1", meta: "Series · Mystery", rating: 4 },
  { title: "Golden Hour", meta: "Movie · Drama", rating: 3 },
];

export function WatchlistPreviewCard() {
  return (
    <div className="card relative overflow-hidden text-[var(--text)]">
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[var(--primary-glow)] blur-3xl" />
      <div className="absolute -right-8 -bottom-10 h-48 w-48 rounded-full bg-[var(--primary-glow)]/60 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text2)]">Preview</p>
          <p className="text-lg font-semibold">Shared watchlist</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--elevated)] px-3 py-1 text-xs font-medium text-[var(--text)] ring-1 ring-[var(--elevated)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--green)]" />
          Live sync
        </div>
      </div>
      <div className="relative mt-6 space-y-3">
        {sampleItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-2xl bg-[var(--elevated)] px-4 py-3 shadow-sm backdrop-blur"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-[var(--text2)]">{item.meta}</p>
            </div>
            <div className="flex items-center gap-1 text-[var(--star)]">
              {"★".repeat(item.rating)}
              {"☆".repeat(5 - item.rating)}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-6 rounded-2xl bg-[var(--elevated)] px-4 py-3 text-sm text-[var(--text2)] ring-1 ring-[var(--elevated)]">
        <p className="font-semibold text-[var(--text)]">“Pick something for us”</p>
        <p>Let the app suggest a title that matches your filters.</p>
      </div>
    </div>
  );
}
