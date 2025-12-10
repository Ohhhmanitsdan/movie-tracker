const sampleItems = [
  { title: "The Last Horizon", meta: "Movie · Sci-Fi · 2024", rating: 5 },
  { title: "Signal // Season 1", meta: "Series · Mystery", rating: 4 },
  { title: "Golden Hour", meta: "Movie · Drama", rating: 3 },
];

export function WatchlistPreviewCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-2xl ring-1 ring-white/10">
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -right-8 -bottom-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-indigo-200">Preview</p>
          <p className="text-lg font-semibold">Shared watchlist</p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-50">
          Live sync
        </div>
      </div>
      <div className="relative mt-6 space-y-3">
        {sampleItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 shadow-sm backdrop-blur"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-indigo-100">{item.meta}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-300">
              {"★".repeat(item.rating)}
              {"☆".repeat(5 - item.rating)}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-6 rounded-2xl bg-white/5 px-4 py-3 text-sm text-indigo-100 ring-1 ring-white/10">
        <p className="font-semibold text-white">“Pick something for us”</p>
        <p>Let the app suggest a title that matches your filters.</p>
      </div>
    </div>
  );
}
