import { HABIT_COLORS, isHabitColor, HABIT_STORAGE_KEY } from '@repo/core';
import { toIsoDate } from './dates';
import type { Habit, Completion } from './types';

export type HabitStore = {
  ownerId: string;
  habits: Habit[];
  completions: Completion[];
};

const STORAGE_KEY = HABIT_STORAGE_KEY;

export function emptyHabitStore(): HabitStore {
  return {
    ownerId: crypto.randomUUID(),
    habits: [],
    completions: [],
  };
}

export function loadHabitStore(): HabitStore {
  if (typeof window === 'undefined') {
    return emptyHabitStore();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyHabitStore();
  }

  try {
    const { ownerId, habits, completions } = JSON.parse(raw) as HabitStore;
    if (!ownerId || !Array.isArray(habits)) {
      return emptyHabitStore();
    }
    return {
      ownerId,
      habits: habits.map(({ createdOn, color, ...habit }, index) => ({
        ...habit,
        createdOn: toIsoDate(createdOn),
        color: isHabitColor(color)
          ? color
          : HABIT_COLORS[index % HABIT_COLORS.length].id,
      })),
      completions: Array.isArray(completions)
        ? completions.map(({ date, ...completion }) => ({
            ...completion,
            date: toIsoDate(date),
          }))
        : [],
    };
  } catch {
    return emptyHabitStore();
  }
}

export function saveHabitStore(store: HabitStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
