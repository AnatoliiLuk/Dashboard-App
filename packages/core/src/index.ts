export {
  GOAL_COLORS,
  HABIT_COLORS,
  goalColor,
  habitColor,
} from './constants/colors';

export {
  addDays,
  addMonths,
  compareDates,
  formatDateRange,
  formatDisplay,
  monthTitle,
  startOfMonth,
  startOfWeek,
  today,
  weekTitle,
} from './utils/date';
export { goalDays, goalTimeline } from './utils/goal-progress';
export type {
  GoalDayState,
  GoalTimeline,
  GoalTimelineDay,
} from './utils/goal-progress';
export { streakFor } from './utils/streak';
