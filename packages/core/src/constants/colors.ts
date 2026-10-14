import type { GoalColor, HabitColor } from '@repo/types';

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

export function habitColor(id: HabitColor) {
  const match = HABIT_COLORS.find((color) => color.id === id);
  return match ?? HABIT_COLORS[0];
}

export const GOAL_COLORS = [
  { id: 'indigo', background: '#e0e7ff', text: '#312e81', bar: '#4f46e5' },
  { id: 'orange', background: '#ffedd5', text: '#7c2d12', bar: '#ea580c' },
  { id: 'lime', background: '#ecfccb', text: '#365314', bar: '#65a30d' },
  { id: 'magenta', background: '#fae8ff', text: '#701a75', bar: '#c026d3' },
  { id: 'slate', background: '#e2e8f0', text: '#0f172a', bar: '#475569' },
  { id: 'crimson', background: '#fee2e2', text: '#7f1d1d', bar: '#b91c1c' },
] as const satisfies ReadonlyArray<{
  id: GoalColor;
  background: string;
  text: string;
  bar: string;
}>;

export function goalColor(id: GoalColor) {
  const match = GOAL_COLORS.find((color) => color.id === id);
  return match ?? GOAL_COLORS[0];
}
