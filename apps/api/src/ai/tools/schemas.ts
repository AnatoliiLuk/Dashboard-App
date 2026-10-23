import { z } from 'zod';

import { createHabitSchema } from '../../validators/habits.validator';

export const HISTORY_MAX_DAYS = 90;

// The model's tool input is untrusted: every handler parses it with these
// schemas first, even though the tool definitions are strict.
export const getHabitsInput = z.object({}).strict();

export const getHabitHistoryInput = z
  .object({
    habitId: z.string().min(1).max(100),
    days: z.number().int().min(1).max(HISTORY_MAX_DAYS),
  })
  .strict();

export const getGoalsInput = z.object({}).strict();

// Same rules as creating a habit through the API, so an accepted proposal
// always passes the create endpoint.
export const proposeHabitInput = createHabitSchema
  .extend({
    name: z.string().trim().min(1, 'Name is required').max(100),
    reason: z.string().trim().min(1).max(300),
  })
  .strict();

export type HabitProposal = z.infer<typeof proposeHabitInput>;
