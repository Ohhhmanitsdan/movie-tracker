"use client";

type Props = {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, size = "md" }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(value === star ? null : star)}
          className={`transition hover:-translate-y-0.5 ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className={sizeClass}>{value && value >= star ? "★" : "☆"}</span>
        </button>
      ))}
    </div>
  );
}
