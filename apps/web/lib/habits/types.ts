import type { Completion, Habit } from '@repo/types';

export type { Completion, DayMark, Habit } from '@repo/types';

/** In-memory habit + completion snapshot used by calendar/log views. */
export type HabitStore = {
  ownerId: string;
  habits: Habit[];
  completions: Completion[];
};
