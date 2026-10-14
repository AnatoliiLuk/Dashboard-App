import { describe, expect, it } from '@jest/globals';
import type { Completion } from '@repo/types';

import { goalProgress } from './goal-progress';

const start = '2026-10-01';
const end = '2026-10-10';

function done(habitId: string, date: string): Completion {
  return {
    id: `${habitId}-${date}`,
    habitId,
    ownerId: 'user-1',
    date,
  };
}

describe('goalProgress', () => {
  it('rounds covered days over the inclusive range', () => {
    const completions = [
      done('habit-1', '2026-10-02'),
      done('habit-1', '2026-10-05'),
    ];

    expect(goalProgress(start, end, ['habit-1'], completions)).toBe(20);
  });

  it('counts one covered day as ten percent of a ten-day goal', () => {
    expect(
      goalProgress(start, end, ['habit-1'], [done('habit-1', '2026-10-01')]),
    ).toBe(10);
  });

  it('counts several habits on the same day once', () => {
    const completions = [
      done('habit-1', '2026-10-03'),
      done('habit-2', '2026-10-03'),
      done('habit-1', '2026-10-04'),
      done('habit-2', '2026-10-04'),
    ];

    expect(goalProgress(start, end, ['habit-1', 'habit-2'], completions)).toBe(
      20,
    );
  });

  it('ignores completions outside the range', () => {
    const completions = [
      done('habit-1', '2026-09-30'),
      done('habit-1', '2026-10-11'),
      done('habit-1', '2026-10-10'),
    ];

    expect(goalProgress(start, end, ['habit-1'], completions)).toBe(10);
  });

  it('ignores habits that are not on the goal', () => {
    const completions = [
      done('habit-1', '2026-10-02'),
      done('habit-9', '2026-10-03'),
    ];

    expect(goalProgress(start, end, ['habit-1'], completions)).toBe(10);
  });
});
