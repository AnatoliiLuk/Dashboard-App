import type { HabitColor } from '@/lib/habits/colors';
import type { HabitToday } from '@/lib/habits/useHabitLog';

export type HabitLoggerProps = {
  habits: HabitToday[];
  onAdd: (name: string, color: HabitColor) => void;
  onToggle: (habitId: string) => void;
  onColor: (habitId: string, color: HabitColor) => void;
  onRename: (habitId: string, name: string) => void;
  onDelete: (habitId: string) => void;
};
