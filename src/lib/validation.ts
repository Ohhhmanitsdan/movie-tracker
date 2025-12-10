import { z } from "zod";

export const signupSchema = z
  .object({
    username: z.string().trim().min(3).max(32),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
    email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(32),
  password: z.string().min(8).max(100),
});

export const watchlistCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const joinSchema = z.object({
  code: z.string().trim().min(6).max(64),
});

export const watchItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(["movie", "series"]),
  year: z.number().min(1800).max(2100).nullable(),
  poster: z.string().url().nullable(),
  genre: z.array(z.string().trim()).default([]),
  synopsis: z.string().trim().nullable(),
  omdbId: z.string().trim().nullable(),
  runtime: z.string().trim().nullable(),
  starRating: z.number().min(1).max(5).nullable().optional(),
});

export const ratingSchema = z.object({
  starRating: z.number().min(1).max(5).nullable(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});
