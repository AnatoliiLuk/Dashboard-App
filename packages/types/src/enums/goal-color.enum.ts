const GOAL_COLOR_IDS = [
  'indigo',
  'orange',
  'lime',
  'magenta',
  'slate',
  'crimson',
] as const;

export type GoalColor = (typeof GOAL_COLOR_IDS)[number];
