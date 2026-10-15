import type { Goal, Habit } from '@repo/types';

export type GoalCardProps = {
  goal: Goal;
  habits: Habit[];
  percent: number;
  selected?: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void | Promise<void>;
};
