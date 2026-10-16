import type { GoalTimeline } from '@repo/core';
import type { Goal, Habit } from '@repo/types';

export type GoalCardProps = {
  goal: Goal;
  habits: Habit[];
  timeline: GoalTimeline;
  selected?: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void | Promise<void>;
};
