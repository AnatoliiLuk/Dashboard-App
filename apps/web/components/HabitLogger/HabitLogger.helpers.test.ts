import { describe, expect, it } from '@jest/globals';

import type { HabitToday } from '@/lib/habits/log';

import { HabitSort } from './HabitLogger.constants';
import { sortHabits } from './HabitLogger.helpers';

function item(
  name: string,
  doneToday: boolean,
  currentStreak: number,
): HabitToday {
  return {
    habit: {
      id: name,
      ownerId: 'user-1',
      name,
      createdOn: '2026-10-01',
      color: 'sky',
    },
    doneToday,
    currentStreak,
    days: [],
  };
}

describe('sortHabits', () => {
  const habits = [
    item('Read', true, 2),
    item('Walk', false, 5),
    item('Stretch', false, 2),
  ];

  it('puts habits completed today first', () => {
    expect(
      sortHabits(habits, HabitSort.Done).map((entry) => entry.habit.name),
    ).toEqual(['Read', 'Stretch', 'Walk']);
  });

  it('puts habits still open today first', () => {
    expect(
      sortHabits(habits, HabitSort.Open).map((entry) => entry.habit.name),
    ).toEqual(['Stretch', 'Walk', 'Read']);
  });

  it('orders habits from the longest streak to the shortest', () => {
    expect(
      sortHabits(habits, HabitSort.Longest).map((entry) => entry.habit.name),
    ).toEqual(['Walk', 'Read', 'Stretch']);
  });

  it('orders habits from the shortest streak to the longest', () => {
    expect(
      sortHabits(habits, HabitSort.Shortest).map((entry) => entry.habit.name),
    ).toEqual(['Read', 'Stretch', 'Walk']);
  });
});
