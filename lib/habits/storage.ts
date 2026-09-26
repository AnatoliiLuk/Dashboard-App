import { HABIT_COLORS, isHabitColor } from './colors';
import { toIsoDate } from './dates';
import type { Habit, Completion } from './types';

export type HabitStore = {
  ownerId: string;
  habits: Habit[];
  completions: Completion[];
};

const STORAGE_KEY = 'habit-log';

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
    const parsed = JSON.parse(raw) as HabitStore;
    if (!parsed.ownerId || !Array.isArray(parsed.habits)) {
      return emptyHabitStore();
    }
    return {
      ownerId: parsed.ownerId,
      habits: parsed.habits.map((habit, index) => ({
        ...habit,
        createdOn: toIsoDate(habit.createdOn),
        color: isHabitColor(habit.color)
          ? habit.color
          : HABIT_COLORS[index % HABIT_COLORS.length].id,
      })),
      completions: Array.isArray(parsed.completions)
        ? parsed.completions.map((completion) => ({
            ...completion,
            date: toIsoDate(completion.date),
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
