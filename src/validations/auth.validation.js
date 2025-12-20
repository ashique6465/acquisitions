import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z
    .string()
    .email()
    .max(255)
    .transform((s) => s.toLowerCase().trim()),
  password: z.string().min(6).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1),
});