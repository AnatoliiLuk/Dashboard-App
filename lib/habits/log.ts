import { HABIT_COLORS, isHabitColor, type HabitColor } from './colors';
import { addDays } from './dates';
import type { HabitStore } from './storage';
import { streakFor } from './streaks';
import type { Completion, DayMark, Habit } from './types';

const RECENT_DAYS = 7;

export type HabitToday = {
  habit: Habit;
  doneToday: boolean;
  currentStreak: number;
  days: DayMark[];
};

export function habitTodayList(store: HabitStore, today: string): HabitToday[] {
  return store.habits.map((habit) => {
    const mine = store.completions.filter(
      (completion) => completion.habitId === habit.id,
    );
    const streak = streakFor(habit, mine, today);

    return {
      habit,
      doneToday: mine.some((completion) => completion.date === today),
      currentStreak: streak.current,
      days: recentDays(habit, mine, today),
    };
  });
}

export function addHabit(
  store: HabitStore,
  name: string,
  today: string,
  color: HabitColor,
): HabitStore {
  const trimmed = name.trim();
  if (!trimmed) {
    return store;
  }

  const habit: Habit = {
    id: crypto.randomUUID(),
    ownerId: store.ownerId,
    name: trimmed,
    createdOn: today,
    color: isHabitColor(color) ? color : HABIT_COLORS[0].id,
  };

  return { ...store, habits: [...store.habits, habit] };
}

export function setHabitColor(
  store: HabitStore,
  habitId: string,
  color: HabitColor,
): HabitStore {
  if (!isHabitColor(color)) {
    return store;
  }

  return {
    ...store,
    habits: store.habits.map((habit) =>
      habit.id === habitId ? { ...habit, color } : habit,
    ),
  };
}

export function toggleToday(
  store: HabitStore,
  habitId: string,
  today: string,
): HabitStore {
  const existing = store.completions.find(
    (completion) => completion.habitId === habitId && completion.date === today,
  );

  if (existing) {
    return {
      ...store,
      completions: store.completions.filter(
        (completion) => completion.id !== existing.id,
      ),
    };
  }

  const completion: Completion = {
    id: crypto.randomUUID(),
    habitId,
    ownerId: store.ownerId,
    date: today,
  };

  return { ...store, completions: [...store.completions, completion] };
}

function recentDays(
  habit: Habit,
  completions: Completion[],
  today: string,
): DayMark[] {
  const done = new Set(completions.map((completion) => completion.date));
  const days: DayMark[] = [];

  for (let offset = RECENT_DAYS - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    days.push({
      date,
      done: date >= habit.createdOn && done.has(date),
    });
  }

  return days;
}
