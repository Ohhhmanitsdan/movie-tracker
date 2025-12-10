"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  id: string;
  autoComplete?: string;
  register: UseFormRegisterReturn;
  error?: string;
};

export function PasswordField({ label, id, autoComplete, register, error }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--text)]" htmlFor={id}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="text-xs font-medium text-[var(--primary)] hover:text-[var(--text)]"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        className="modern"
        placeholder="••••••••"
        {...register}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
