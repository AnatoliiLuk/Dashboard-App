import type { HabitColor } from './colors';
import {
  addDays,
  addMonths,
  compareDates,
  startOfMonth,
  startOfWeek,
} from './dates';
import type { HabitStore } from './storage';

export type CalendarHabit = {
  id: string;
  name: string;
  color: HabitColor;
};

export type CalendarDay = {
  date: string;
  inMonth: boolean;
  habits: CalendarHabit[];
};

export const WEEKDAYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

function habitsOnDate({
  habits,
  completions,
}: HabitStore): Map<string, CalendarHabit[]> {
  const habitsByDate = new Map<string, CalendarHabit[]>();
  for (const { habitId, date } of completions) {
    const habit = habits.find(({ id }) => id === habitId);
    if (!habit) {
      continue;
    }
    const { id, name, color } = habit;
    const listed = habitsByDate.get(date) ?? [];
    listed.push({ id, name, color });
    habitsByDate.set(date, listed);
  }
  return habitsByDate;
}

export function weekDays(store: HabitStore, date: string): CalendarDay[] {
  const habitsByDate = habitsOnDate(store);
  const weekStart = startOfWeek(date);

  return Array.from({ length: 7 }, (_, offset) => {
    const day = addDays(weekStart, offset);
    return {
      date: day,
      inMonth: true,
      habits: habitsByDate.get(day) ?? [],
    };
  });
}

export function monthWeeks(store: HabitStore, month: string): CalendarDay[][] {
  const habitsByDate = habitsOnDate(store);

  const monthStart = startOfMonth(month);
  const monthEnd = addDays(addMonths(monthStart, 1), -1);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = startOfWeek(monthEnd);
  const weeks: CalendarDay[][] = [];

  for (
    let weekStart = gridStart;
    compareDates(weekStart, gridEnd) <= 0;
    weekStart = addDays(weekStart, 7)
  ) {
    const week: CalendarDay[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(weekStart, offset);
      week.push({
        date,
        inMonth: date >= monthStart && date <= monthEnd,
        habits: habitsByDate.get(date) ?? [],
      });
    }
    weeks.push(week);
  }

  return weeks;
}
