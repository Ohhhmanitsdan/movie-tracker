"use client";

type Filters = {
  type: "all" | "movie" | "series";
  genre: "all" | string;
  minRating: "all" | 1 | 2 | 3 | 4 | 5;
};

type Props = {
  filters: Filters;
  genres: string[];
  onChange: (filters: Filters) => void;
  onRandomPick: () => void;
};

export function FilterBar({ filters, genres, onChange, onRandomPick }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
      <Select
        label="Type"
        value={filters.type}
        options={[
          { label: "All", value: "all" },
          { label: "Movies", value: "movie" },
          { label: "Series", value: "series" },
        ]}
        onChange={(value) => onChange({ ...filters, type: value as Filters["type"] })}
      />
      <Select
        label="Genre"
        value={filters.genre}
        options={[{ label: "All", value: "all" }].concat(
          genres.map((g) => ({ label: g, value: g })),
        )}
        onChange={(value) => onChange({ ...filters, genre: value as Filters["genre"] })}
      />
      <Select
        label="Rating"
        value={filters.minRating}
        options={[
          { label: "Any", value: "all" },
          { label: "1★+", value: 1 },
          { label: "2★+", value: 2 },
          { label: "3★+", value: 3 },
          { label: "4★+", value: 4 },
          { label: "5★", value: 5 },
        ]}
        onChange={(value) => onChange({ ...filters, minRating: value as Filters["minRating"] })}
      />
      <button
        type="button"
        onClick={onRandomPick}
        className="ml-auto inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        🎲 Pick for us
      </button>
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (value: string) => void;
};

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
