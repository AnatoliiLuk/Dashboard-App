import { colors } from '@/lib/colors';

export const HABIT_COLORS = [
  { id: 'sky', background: colors.sky100, text: colors.sky900 },
  { id: 'green', background: colors.green100, text: colors.green950 },
  { id: 'amber', background: colors.amber100, text: colors.amber950 },
  { id: 'rose', background: colors.rose100, text: colors.rose900 },
  { id: 'violet', background: colors.violet100, text: colors.violet900 },
  { id: 'teal', background: colors.teal100, text: colors.teal900 },
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number]['id'];

export function isHabitColor(value: unknown): value is HabitColor {
  return HABIT_COLORS.some((color) => color.id === value);
}

export function habitColor(id: HabitColor) {
  const match = HABIT_COLORS.find((color) => color.id === id);
  return match ?? HABIT_COLORS[0];
}
