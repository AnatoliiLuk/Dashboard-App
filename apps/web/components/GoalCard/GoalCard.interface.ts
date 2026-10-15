import type { Goal, Habit } from '@repo/types';

import type { GoalFormValues } from '@/lib/forms/schemas';

export type GoalCardProps = {
  goal: Goal;
  habits: Habit[];
  percent: number;
  onUpdate: (id: string, values: GoalFormValues) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};
