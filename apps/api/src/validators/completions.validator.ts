import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createCompletionSchema = z.object({
  habitId: z.string().min(1, 'Habit id is required'),
  date: isoDateSchema,
});

export const toggleCompletionSchema = createCompletionSchema;
