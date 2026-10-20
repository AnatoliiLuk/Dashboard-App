import type { HabitToday } from '@/lib/habits/useHabitLog';

export type HabitStatus = 'success' | 'warning' | 'info';

export type HabitCardProps = {
  item: HabitToday;
  selected?: boolean;
  onToggle: (habitId: string) => void | Promise<void>;
  onEdit: () => void;
  onArchive: (habitId: string, archived: boolean) => void | Promise<void>;
  onDelete: (habitId: string) => void | Promise<void>;
};
