import { describe, expect, it } from '@jest/globals';
import type { Completion, Habit } from '@repo/types';

import { streakFor } from './streak';

function habit(createdOn: string): Habit {
  return {
    id: 'habit-1',
    ownerId: 'user-1',
    name: 'Read',
    createdOn,
    color: 'sky',
  };
}

function done(...dates: string[]): Completion[] {
  return dates.map((date, index) => ({
    id: `completion-${index}`,
    habitId: 'habit-1',
    ownerId: 'user-1',
    date,
  }));
}

describe('streakFor', () => {
  it('leaves today open when nothing is logged yet', () => {
    expect(streakFor(habit('2026-10-06'), [], '2026-10-06')).toEqual({
      current: 0,
      best: 0,
    });
  });

  it('counts a completed today', () => {
    expect(
      streakFor(habit('2026-10-06'), done('2026-10-06'), '2026-10-06'),
    ).toEqual({
      current: 1,
      best: 1,
    });
  });

  it('keeps yesterday’s run while today is still open', () => {
    expect(
      streakFor(
        habit('2026-10-05'),
        done('2026-10-05', '2026-10-06'),
        '2026-10-07',
      ),
    ).toEqual({
      current: 2,
      best: 2,
    });
  });

  it('drops the run after a missed day', () => {
    expect(
      streakFor(habit('2026-10-05'), done('2026-10-05'), '2026-10-07'),
    ).toEqual({
      current: 0,
      best: 1,
    });
  });

  it('remembers a longer earlier run', () => {
    expect(
      streakFor(
        habit('2026-10-05'),
        done('2026-10-05', '2026-10-06', '2026-10-07', '2026-10-09'),
        '2026-10-09',
      ),
    ).toEqual({
      current: 1,
      best: 3,
    });
  });

  it('ignores completions for another habit', () => {
    const other: Completion = {
      id: 'other',
      habitId: 'habit-2',
      ownerId: 'user-1',
      date: '2026-10-06',
    };

    expect(streakFor(habit('2026-10-06'), [other], '2026-10-06')).toEqual({
      current: 0,
      best: 0,
    });
  });
});
