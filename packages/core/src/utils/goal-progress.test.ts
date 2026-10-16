import { describe, expect, it } from '@jest/globals';
import type { Completion } from '@repo/types';

import { goalDays, goalTimeline } from './goal-progress';

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

describe('goalTimeline', () => {
  const completions = [
    done('habit-1', '2026-10-01'),
    done('habit-1', '2026-10-02'),
    done('habit-2', '2026-10-02'),
    done('habit-1', '2026-10-04'),
    done('habit-1', '2026-10-04'),
    done('habit-9', '2026-10-03'),
    done('habit-1', '2026-09-30'),
    done('habit-1', '2026-10-11'),
  ];

  it('keeps the day index when a completion is added', () => {
    const habits = ['habit-1', 'habit-2'] as const;
    const without = goalTimeline(start, end, habits, [], '2026-10-05');
    const withLogs = goalTimeline(
      start,
      end,
      habits,
      completions,
      '2026-10-05',
    );

    expect(without.day).toBe(5);
    expect(withLogs.day).toBe(5);
    expect(withLogs.total).toBe(10);
    expect(withLogs.left).toBe(6);
    expect(withLogs.startsIn).toBe(0);
  });

  it('counts each linked habit once and leaves today open', () => {
    const timeline = goalTimeline(
      start,
      end,
      ['habit-1', 'habit-2'],
      completions,
      '2026-10-05',
    );

    expect(
      timeline.days.map(({ date, logged, state }) => [date, logged, state]),
    ).toEqual([
      ['2026-10-01', 1, 'closed'],
      ['2026-10-02', 2, 'closed'],
      ['2026-10-03', 0, 'closed'],
      ['2026-10-04', 1, 'closed'],
      ['2026-10-05', 0, 'open'],
      ['2026-10-06', 0, 'future'],
      ['2026-10-07', 0, 'future'],
      ['2026-10-08', 0, 'future'],
      ['2026-10-09', 0, 'future'],
      ['2026-10-10', 0, 'future'],
    ]);
  });

  it('records a log on today without closing the day', () => {
    const timeline = goalTimeline(
      start,
      end,
      ['habit-1'],
      [done('habit-1', '2026-10-05')],
      '2026-10-05',
    );
    const today = timeline.days.find((day) => day.date === '2026-10-05');

    expect(today).toEqual({
      date: '2026-10-05',
      logged: 1,
      state: 'open',
    });
    expect(timeline.day).toBe(5);
  });

  it('closes every day once the goal has ended', () => {
    const timeline = goalTimeline(
      start,
      end,
      ['habit-1'],
      [done('habit-1', '2026-10-10')],
      '2026-10-11',
    );

    expect(timeline.day).toBe(10);
    expect(timeline.left).toBe(0);
    expect(timeline.days.every((day) => day.state === 'closed')).toBe(true);
    expect(timeline.days.at(-1)).toMatchObject({
      date: '2026-10-10',
      logged: 1,
      state: 'closed',
    });
  });

  it('treats the whole range as ahead before the start', () => {
    const timeline = goalTimeline(start, end, ['habit-1'], [], '2026-09-28');

    expect(timeline.day).toBe(0);
    expect(timeline.startsIn).toBe(3);
    expect(timeline.days.every((day) => day.state === 'future')).toBe(true);
  });

  it('keeps a same-day goal open until the day has passed', () => {
    const open = goalTimeline(
      '2026-10-15',
      '2026-10-15',
      ['habit-1'],
      [],
      '2026-10-15',
    );
    const closed = goalTimeline(
      '2026-10-15',
      '2026-10-15',
      ['habit-1'],
      [done('habit-1', '2026-10-15')],
      '2026-10-16',
    );

    expect(open.days).toEqual([
      { date: '2026-10-15', logged: 0, state: 'open' },
    ]);
    expect(closed.days).toEqual([
      { date: '2026-10-15', logged: 1, state: 'closed' },
    ]);
  });

  it('returns an empty timeline when the range is reversed', () => {
    expect(
      goalTimeline('2026-10-10', '2026-10-01', ['habit-1'], [], '2026-10-05'),
    ).toEqual({ day: 0, total: 0, left: 0, startsIn: 0, days: [] });
  });
});

describe('goalDays', () => {
  it('counts every day in the range and the days still ahead', () => {
    expect(goalDays(start, end, '2026-09-30')).toEqual({ total: 10, left: 10 });
    expect(goalDays(start, end, '2026-10-01')).toEqual({ total: 10, left: 10 });
    expect(goalDays(start, end, '2026-10-05')).toEqual({ total: 10, left: 6 });
    expect(goalDays(start, end, '2026-10-10')).toEqual({ total: 10, left: 1 });
    expect(goalDays(start, end, '2026-10-11')).toEqual({ total: 10, left: 0 });
  });

  it('counts a single day and a leap-day range', () => {
    expect(goalDays('2026-10-15', '2026-10-15', '2026-10-15')).toEqual({
      total: 1,
      left: 1,
    });
    expect(goalDays('2024-02-01', '2024-02-29', '2024-02-28')).toEqual({
      total: 29,
      left: 2,
    });
  });
});
