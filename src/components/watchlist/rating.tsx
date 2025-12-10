"use client";

import clsx from "clsx";

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
};

const skull = "💀";

export function SkullRating({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1" aria-label="Skull rating">
      {[1, 2, 3, 4, 5].map((score) => {
        const filled = value !== null && score <= value;
        return (
          <button
            key={score}
            type="button"
            onClick={() => onChange(filled && value === score ? null : score)}
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-full transition",
              filled
                ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                : "bg-white text-slate-400 ring-1 ring-slate-200 hover:text-amber-500",
            )}
            aria-pressed={filled}
            aria-label={`Set rating to ${score}`}
          >
            <span className="text-lg">{skull}</span>
          </button>
        );
      })}
    </div>
  );
}
