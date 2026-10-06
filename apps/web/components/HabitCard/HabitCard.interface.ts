import type { HabitColor } from '@/lib/habits/colors';
import type { HabitToday } from '@/lib/habits/useHabitLog';

export type HabitStatus = 'success' | 'warning' | 'info';

export type HabitCardProps = {
  item: HabitToday;
  onToggle: (habitId: string) => void | Promise<void>;
  onColor: (habitId: string, color: HabitColor) => void | Promise<void>;
  onRename: (habitId: string, name: string) => void | Promise<void>;
  onDelete: (habitId: string) => void | Promise<void>;
};
