import type { HabitColor } from './colors';

export type Habit = {
  id: string;
  ownerId: string;
  name: string;
  createdOn: string;
  color: HabitColor;
};

export type Completion = {
  id: string;
  habitId: string;
  ownerId: string;
  date: string;
};

export type Streak = {
  current: number;
  best: number;
};

export type DayMark = {
  date: string;
  done: boolean;
};
