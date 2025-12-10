"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { PasswordField } from "./PasswordField";

type AuthCardProps = {
  variant: "login" | "register";
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitting: boolean;
  error?: string | null;
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export function AuthCard({ variant, onSubmit, submitting, error }: AuthCardProps) {
  const schema = variant === "login" ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues:
      variant === "login"
        ? { username: "", password: "" }
        : { username: "", email: "", password: "", confirmPassword: "" },
  });

  const title = variant === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    variant === "login"
      ? "Sign in to your shared watchlist."
      : "Start a shared watchlist with friends.";

  return (
    <div className="card w-full max-w-md backdrop-blur">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text2)]">
          Watchlist
        </p>
        <h1 className="text-2xl font-bold text-[var(--text)]">{title}</h1>
        <p className="text-sm text-[var(--text2)]">{subtitle}</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text)]" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            className="modern"
            placeholder="username"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-xs text-[var(--danger)]">{String(errors.username.message)}</p>
          )}
        </div>

        {variant === "register" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text)]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="modern"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-[var(--danger)]">{String(errors.email.message)}</p>
            )}
          </div>
        )}

        <PasswordField
          label="Password"
          id="password"
          autoComplete={variant === "login" ? "current-password" : "new-password"}
          register={register("password")}
          error={errors.password?.message as string | undefined}
        />

        {variant === "register" && (
          <PasswordField
            label="Confirm password"
            id="confirmPassword"
            autoComplete="new-password"
            register={register("confirmPassword")}
            error={errors.confirmPassword?.message as string | undefined}
          />
        )}

        {error && (
          <div className="rounded-lg bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--danger)] ring-1 ring-[var(--danger)]/40">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !isValid}
          className={clsx("btn btn-primary w-full", submitting || !isValid ? "opacity-80" : "")}
        >
          {submitting ? "Please wait..." : variant === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm text-[var(--text2)]">
        <div>
          {variant === "login" ? (
            <Link href="/app/(auth)/register" className="text-[var(--primary)] hover:text-[var(--text)]">
              Create account
            </Link>
          ) : (
            <Link href="/app/(auth)/login" className="text-[var(--primary)] hover:text-[var(--text)]">
              Sign in
            </Link>
          )}
        </div>
        {variant === "login" && (
          <Link href="#" className="text-[var(--text2)] hover:text-[var(--text)]">
            Forgot password?
          </Link>
        )}
      </div>
    </div>
  );
}
