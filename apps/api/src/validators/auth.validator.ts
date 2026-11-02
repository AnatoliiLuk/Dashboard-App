import { z } from 'zod';

// Emails are stored trimmed and lowercased, so lookups and the unique index
// ignore case. Reuse this for every field that takes an email.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Email must be at most 254 characters')
  .email('Invalid email');

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
