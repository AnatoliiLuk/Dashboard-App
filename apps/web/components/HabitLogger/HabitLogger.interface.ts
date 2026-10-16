import type { HabitFormValues } from '@/lib/forms/schemas';
import type { HabitColor } from '@/lib/habits/colors';
import type { HabitToday } from '@/lib/habits/useHabitLog';

export type HabitLoggerProps = {
  habits: HabitToday[];
  onAdd: (name: string, color: HabitColor) => void | Promise<void>;
  onUpdate: (habitId: string, values: HabitFormValues) => void | Promise<void>;
  onToggle: (habitId: string) => void | Promise<void>;
  onDelete: (habitId: string) => void | Promise<void>;
};
