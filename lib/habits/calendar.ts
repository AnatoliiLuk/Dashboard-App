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
};

export type CalendarDay = {
  date: string;
  inMonth: boolean;
  habits: CalendarHabit[];
};

const WEEKDAY_LABELS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
] as const;

export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function monthWeeks(store: HabitStore, month: string): CalendarDay[][] {
  const habitsByDate = new Map<string, CalendarHabit[]>();
  for (const completion of store.completions) {
    const habit = store.habits.find((item) => item.id === completion.habitId);
    if (!habit) {
      continue;
    }
    const habits = habitsByDate.get(completion.date) ?? [];
    habits.push({ id: habit.id, name: habit.name });
    habitsByDate.set(completion.date, habits);
  }

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
