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
    <div className="flex flex-wrap items-center gap-3 card">
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
        className="ml-auto btn btn-primary"
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
    <label className="grid gap-1 text-xs font-semibold text-[var(--text)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="modern"
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
