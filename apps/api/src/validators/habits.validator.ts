import { HabitColor } from '@prisma/client';
import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.nativeEnum(HabitColor),
});

export const updateHabitSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    color: z.nativeEnum(HabitColor).optional(),
  })
  .refine((data) => data.name !== undefined || data.color !== undefined, {
    message: 'At least one field (name or color) is required',
  });
