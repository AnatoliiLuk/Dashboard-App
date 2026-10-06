import { addDays, startOfWeek } from './dates';
import { streakFor } from './streaks';
import type { Completion, DayMark, Habit, HabitStore } from './types';

export type HabitToday = {
  habit: Habit;
  doneToday: boolean;
  currentStreak: number;
  days: DayMark[];
};

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
      days: weekMarks(habit, mine, today),
    };
  });
}

function weekMarks(
  habit: Habit,
  completions: Completion[],
  today: string,
): DayMark[] {
  const { createdOn } = habit;
  const done = new Set(completions.map(({ date }) => date));
  const weekStart = startOfWeek(today);

  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(weekStart, offset);
    return {
      date,
      done: date <= today && date >= createdOn && done.has(date),
    };
  });
}
