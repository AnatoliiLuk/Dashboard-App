export const HABIT_COLORS = [
  { id: 'sky', label: 'Sky', background: '#dbeafe', text: '#1e3a8a' },
  { id: 'green', label: 'Green', background: '#dcfce7', text: '#14532d' },
  { id: 'amber', label: 'Amber', background: '#fef3c7', text: '#78350f' },
  { id: 'rose', label: 'Rose', background: '#ffe4e6', text: '#881337' },
  { id: 'violet', label: 'Violet', background: '#ede9fe', text: '#4c1d95' },
  { id: 'teal', label: 'Teal', background: '#ccfbf1', text: '#134e4a' },
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number]['id'];

export function isHabitColor(value: unknown): value is HabitColor {
  return HABIT_COLORS.some((color) => color.id === value);
}

export function habitColor(id: HabitColor) {
  const match = HABIT_COLORS.find((color) => color.id === id);
  return match ?? HABIT_COLORS[0];
}
