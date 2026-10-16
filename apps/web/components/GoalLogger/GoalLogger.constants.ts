export const GoalSort = {
  Newest: 'newest',
  Oldest: 'oldest',
  Longest: 'longest',
  Shortest: 'shortest',
} as const;

export type GoalSort = (typeof GoalSort)[keyof typeof GoalSort];

export const GOAL_SORTS = [
  GoalSort.Newest,
  GoalSort.Oldest,
  GoalSort.Longest,
  GoalSort.Shortest,
] as const;

export const GOAL_SORT_KEY = 'goal-list-sort';

export const goalSortLabel = {
  [GoalSort.Newest]: 'goals.newest',
  [GoalSort.Oldest]: 'goals.oldest',
  [GoalSort.Longest]: 'goals.longest',
  [GoalSort.Shortest]: 'goals.shortest',
} as const;
