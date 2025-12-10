import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata = {
  title: "Watchlist Auth",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,166,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(63,185,80,0.12),transparent_30%)]" />
        <div className="absolute inset-0 bg-[var(--bg)]/70 backdrop-blur" />
        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
