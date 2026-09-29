import type { HabitColor } from '@repo/types';
import { HABIT_COLOR_IDS } from '@repo/types';

export const HABIT_COLORS = [
  { id: 'sky', background: '#dbeafe', text: '#1e3a8a' },
  { id: 'green', background: '#dcfce7', text: '#14532d' },
  { id: 'amber', background: '#fef3c7', text: '#78350f' },
  { id: 'rose', background: '#ffe4e6', text: '#881337' },
  { id: 'violet', background: '#ede9fe', text: '#4c1d95' },
  { id: 'teal', background: '#ccfbf1', text: '#134e4a' },
] as const satisfies ReadonlyArray<{
  id: HabitColor;
  background: string;
  text: string;
}>;

export function isHabitColor(value: unknown): value is HabitColor {
  return HABIT_COLOR_IDS.some((color) => color === value);
}

export function habitColor(id: HabitColor) {
  const match = HABIT_COLORS.find((color) => color.id === id);
  return match ?? HABIT_COLORS[0];
}
