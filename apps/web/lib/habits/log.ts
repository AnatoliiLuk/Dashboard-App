import { addDays, compareDates } from './dates';
import { streakFor } from './streaks';
import type { Completion, DayMark, Habit, HabitStore } from './types';

// A day in the card strip; loggable days can be toggled from the log.
export type HabitDay = DayMark & { loggable: boolean };

export type HabitToday = {
  habit: Habit;
  doneToday: boolean;
  currentStreak: number;
  days: HabitDay[];
};

export const RECENT_DAYS = 7;

export function habitTodayList(
  { habits, completions }: HabitStore,
  today: string,
): HabitToday[] {
  return habits.map((habit) => {
    const { id } = habit;
    const mine = completions.filter(({ habitId }) => habitId === id);
    const { current } = streakFor(habit, mine, today);

    return {
      habit,
      doneToday: mine.some(({ date }) => date === today),
      currentStreak: current,
      days: recentDays(habit, mine, today),
    };
  });
}

// The last RECENT_DAYS days ending today, so yesterday is always reachable.
function recentDays(
  habit: Habit,
  completions: Completion[],
  today: string,
): HabitDay[] {
  const { createdOn, archivedAt } = habit;
  const done = new Set(completions.map(({ date }) => date));
  const first = addDays(today, 1 - RECENT_DAYS);

  return Array.from({ length: RECENT_DAYS }, (_, offset) => {
    const date = addDays(first, offset);
    const existed = compareDates(date, createdOn) >= 0;
    return {
      date,
      done: existed && done.has(date),
      loggable: existed && !archivedAt,
    };
  });
}
