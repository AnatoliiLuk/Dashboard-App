import type { Completion } from '@repo/types';

import { addDays, compareDates } from './date';

const MS_PER_DAY = 86_400_000;

export type GoalDayState = 'future' | 'open' | 'closed';

export type GoalTimelineDay = {
  date: string;
  logged: number;
  state: GoalDayState;
};

export type GoalTimeline = {
  day: number;
  total: number;
  left: number;
  startsIn: number;
  days: GoalTimelineDay[];
};

export function goalTimeline(
  start: string,
  end: string,
  habitIds: readonly string[],
  completions: readonly Completion[],
  asOf: string,
): GoalTimeline {
  const total = inclusiveDayCount(start, end);
  const { left } = goalDays(start, end, asOf);

  if (total === 0) {
    return { day: 0, total: 0, left: 0, startsIn: 0, days: [] };
  }

  const before = compareDates(asOf, start) < 0;
  const after = compareDates(asOf, end) > 0;
  let day = inclusiveDayCount(start, asOf);
  if (before) {
    day = 0;
  } else if (after) {
    day = total;
  }
  const startsIn = before ? inclusiveDayCount(asOf, start) - 1 : 0;
  const loggedByDay = habitCounts(start, end, habitIds, completions);

  const days: GoalTimelineDay[] = [];
  for (
    let date = start;
    compareDates(date, end) <= 0;
    date = addDays(date, 1)
  ) {
    days.push({
      date,
      logged: loggedByDay.get(date) ?? 0,
      state: dayState(date, asOf, before, after),
    });
  }

  return { day, total, left, startsIn, days };
}

export function goalDays(
  start: string,
  end: string,
  asOf: string,
): { total: number; left: number } {
  const total = inclusiveDayCount(start, end);
  if (total === 0 || compareDates(asOf, end) > 0) {
    return { total, left: 0 };
  }

  const from = compareDates(asOf, start) < 0 ? start : asOf;
  return { total, left: inclusiveDayCount(from, end) };
}

function habitCounts(
  start: string,
  end: string,
  habitIds: readonly string[],
  completions: readonly Completion[],
): Map<string, number> {
  const linked = new Set(habitIds);
  const byDay = new Map<string, Set<string>>();

  for (const completion of completions) {
    if (!linked.has(completion.habitId)) {
      continue;
    }

    if (
      compareDates(completion.date, start) < 0 ||
      compareDates(completion.date, end) > 0
    ) {
      continue;
    }

    const habits = byDay.get(completion.date) ?? new Set<string>();
    habits.add(completion.habitId);
    byDay.set(completion.date, habits);
  }

  return new Map(
    [...byDay.entries()].map(([date, habits]) => [date, habits.size]),
  );
}

function dayState(
  date: string,
  asOf: string,
  before: boolean,
  after: boolean,
): GoalDayState {
  if (before || compareDates(date, asOf) > 0) {
    return 'future';
  }

  if (after || compareDates(date, asOf) < 0) {
    return 'closed';
  }

  return 'open';
}

function inclusiveDayCount(start: string, end: string): number {
  if (compareDates(start, end) > 0) {
    return 0;
  }

  return utcDayNumber(end) - utcDayNumber(start) + 1;
}

function utcDayNumber(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}
