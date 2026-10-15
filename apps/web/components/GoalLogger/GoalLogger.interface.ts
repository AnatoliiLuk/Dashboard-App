import type { Goal, Habit } from '@repo/types';

import type { GoalFormValues } from '@/lib/forms/schemas';

export type GoalListItem = {
  goal: Goal;
  percent: number;
};

export type GoalLoggerProps = {
  goals: GoalListItem[];
  habits: Habit[];
  onAdd: (values: GoalFormValues) => void | Promise<void>;
  onUpdate: (id: string, values: GoalFormValues) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};
