export {
  GOAL_COLORS,
  HABIT_COLORS,
  goalColor,
  habitColor,
} from './constants/colors';
export { MAX_GOAL_HABITS } from './constants/goals';

export {
  addDays,
  addMonths,
  compareDates,
  formatDateRange,
  formatDateTime,
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
