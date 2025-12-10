"use client";

import { signIn, signOut } from "next-auth/react";

type ButtonProps = {
  className?: string;
};

export function SignInButton({ className }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/50 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${className ?? ""}`}
    >
      <span>Sign in with Google</span>
    </button>
  );
}

export function SignOutButton({ className }: ButtonProps) {
  return (
      <button
        type="button"
        onClick={() => signOut()}
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md ${className ?? ""}`}
      >
        Sign out
      </button>
  );
}
