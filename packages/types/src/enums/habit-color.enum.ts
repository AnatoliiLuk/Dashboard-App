const HABIT_COLOR_IDS = [
  'sky',
  'green',
  'amber',
  'rose',
  'violet',
  'teal',
] as const;

export type HabitColor = (typeof HABIT_COLOR_IDS)[number];
