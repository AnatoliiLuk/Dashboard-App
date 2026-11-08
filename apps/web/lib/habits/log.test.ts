import { describe, expect, it } from '@jest/globals';

import { habitTodayList } from './log';
import type { HabitStore } from './types';

const habit = {
  id: 'habit-1',
  ownerId: 'user-1',
  name: 'Read',
  color: 'sky' as const,
  createdOn: '2026-11-03',
  archivedAt: null,
};

function store(overrides: Partial<HabitStore> = {}): HabitStore {
  return {
    ownerId: 'user-1',
    habits: [habit],
    completions: [
      { id: 'c1', habitId: 'habit-1', ownerId: 'user-1', date: '2026-11-05' },
      { id: 'c2', habitId: 'habit-1', ownerId: 'user-1', date: '2026-11-06' },
    ],
    ...overrides,
  };
}

describe('habitTodayList', () => {
  it('lists the last 7 days ending today, loggable from creation on', () => {
    const [item] = habitTodayList(store(), '2026-11-09');

    expect(item.days).toEqual([
      { date: '2026-11-03', done: false, loggable: true },
      { date: '2026-11-04', done: false, loggable: true },
      { date: '2026-11-05', done: true, loggable: true },
      { date: '2026-11-06', done: true, loggable: true },
      { date: '2026-11-07', done: false, loggable: true },
      { date: '2026-11-08', done: false, loggable: true },
      { date: '2026-11-09', done: false, loggable: true },
    ]);
  });

  it('keeps days before creation locked and not done', () => {
    const [item] = habitTodayList(
      store({
        completions: [
          {
            id: 'c0',
            habitId: 'habit-1',
            ownerId: 'user-1',
            date: '2026-11-01',
          },
        ],
      }),
      '2026-11-05',
    );

    expect(item.days.slice(0, 3)).toEqual([
      { date: '2026-10-30', done: false, loggable: false },
      { date: '2026-10-31', done: false, loggable: false },
      { date: '2026-11-01', done: false, loggable: false },
    ]);
    expect(item.days.at(-1)).toEqual({
      date: '2026-11-05',
      done: false,
      loggable: true,
    });
  });

  it('locks every day of an archived habit', () => {
    const [item] = habitTodayList(
      store({ habits: [{ ...habit, archivedAt: '2026-11-08T10:00:00.000Z' }] }),
      '2026-11-09',
    );

    expect(item.days.every(({ loggable }) => !loggable)).toBe(true);
  });

  it('counts a backfilled yesterday toward the streak', () => {
    const [item] = habitTodayList(
      store({
        completions: [
          {
            id: 'c1',
            habitId: 'habit-1',
            ownerId: 'user-1',
            date: '2026-11-07',
          },
          {
            id: 'c2',
            habitId: 'habit-1',
            ownerId: 'user-1',
            date: '2026-11-08',
          },
          {
            id: 'c3',
            habitId: 'habit-1',
            ownerId: 'user-1',
            date: '2026-11-09',
          },
        ],
      }),
      '2026-11-09',
    );

    expect(item.currentStreak).toBe(3);
  });
});
