import type { GoalTimeline } from '@repo/core';
import type { Goal, Habit } from '@repo/types';

import type { GoalFormValues } from '@/lib/forms/schemas';

export type GoalListItem = {
  goal: Goal;
  timeline: GoalTimeline;
};

export type GoalLoggerProps = {
  goals: GoalListItem[];
  habits: Habit[];
  onAdd: (values: GoalFormValues) => void | Promise<void>;
  onUpdate: (id: string, values: GoalFormValues) => void | Promise<void>;
  onArchive: (id: string, archived: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};
