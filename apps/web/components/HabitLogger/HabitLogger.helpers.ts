import type { HabitToday } from '@/lib/habits/log';

import {
  HABIT_SORT_KEY,
  HABIT_SORTS,
  HabitSort,
} from './HabitLogger.constants';

export function loadHabitSort(): HabitSort {
  if (typeof window === 'undefined') {
    return HabitSort.Open;
  }

  const stored = window.localStorage.getItem(HABIT_SORT_KEY);
  return isHabitSort(stored) ? stored : HabitSort.Open;
}

export function saveHabitSort(sort: HabitSort) {
  window.localStorage.setItem(HABIT_SORT_KEY, sort);
}

export function sortHabits(
  habits: readonly HabitToday[],
  sort: HabitSort,
): HabitToday[] {
  return [...habits].sort((left, right) => compareHabits(left, right, sort));
}

function compareHabits(
  left: HabitToday,
  right: HabitToday,
  sort: HabitSort,
): number {
  if (sort === HabitSort.Done || sort === HabitSort.Open) {
    const completed = Number(right.doneToday) - Number(left.doneToday);
    if (completed !== 0) {
      return sort === HabitSort.Done ? completed : -completed;
    }

    return left.habit.name.localeCompare(right.habit.name);
  }

  const streak = left.currentStreak - right.currentStreak;
  if (streak !== 0) {
    return sort === HabitSort.Shortest ? streak : -streak;
  }

  return left.habit.name.localeCompare(right.habit.name);
}

function isHabitSort(value: string | null): value is HabitSort {
  return HABIT_SORTS.some((sort) => sort === value);
}
