import { HABIT_COLORS, isHabitColor, type HabitColor } from './colors';
import { addDays, startOfWeek } from './dates';
import type { HabitStore } from './storage';
import { streakFor } from './streaks';
import type { Completion, DayMark, Habit } from './types';

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

  const { ownerId, habits } = store;
  const habit: Habit = {
    id: crypto.randomUUID(),
    ownerId,
    name: trimmed,
    createdOn: today,
    color: isHabitColor(color) ? color : HABIT_COLORS[0].id,
  };

  return { ...store, habits: [...habits, habit] };
}

export function renameHabit(
  store: HabitStore,
  habitId: string,
  name: string,
): HabitStore {
  const trimmed = name.trim();
  if (!trimmed) {
    return store;
  }

  const { habits } = store;

  return {
    ...store,
    habits: habits.map((habit) =>
      habit.id === habitId ? { ...habit, name: trimmed } : habit,
    ),
  };
}

export function deleteHabit(store: HabitStore, habitId: string): HabitStore {
  const { habits, completions } = store;

  return {
    ...store,
    habits: habits.filter(({ id }) => id !== habitId),
    completions: completions.filter(({ habitId: id }) => id !== habitId),
  };
}

export function setHabitColor(
  store: HabitStore,
  habitId: string,
  color: HabitColor,
): HabitStore {
  if (!isHabitColor(color)) {
    return store;
  }

  const { habits } = store;

  return {
    ...store,
    habits: habits.map((habit) =>
      habit.id === habitId ? { ...habit, color } : habit,
    ),
  };
}

export function toggleToday(
  store: HabitStore,
  habitId: string,
  today: string,
): HabitStore {
  const { completions, ownerId } = store;
  const existing = completions.find(
    ({ habitId: id, date }) => id === habitId && date === today,
  );

  if (existing) {
    return {
      ...store,
      completions: completions.filter(({ id }) => id !== existing.id),
    };
  }

  const completion: Completion = {
    id: crypto.randomUUID(),
    habitId,
    ownerId,
    date: today,
  };

  return { ...store, completions: [...completions, completion] };
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
