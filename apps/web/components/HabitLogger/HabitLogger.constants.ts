export const HabitSort = {
  Done: 'done',
  Open: 'open',
  Longest: 'longest',
  Shortest: 'shortest',
} as const;

export type HabitSort = (typeof HabitSort)[keyof typeof HabitSort];

export const HABIT_SORTS = [
  HabitSort.Done,
  HabitSort.Open,
  HabitSort.Longest,
  HabitSort.Shortest,
] as const;

export const HABIT_SORT_KEY = 'habit-list-sort';

export const habitSortLabel = {
  [HabitSort.Done]: 'log.doneSort',
  [HabitSort.Open]: 'log.openSort',
  [HabitSort.Longest]: 'log.longest',
  [HabitSort.Shortest]: 'log.shortest',
} as const;
