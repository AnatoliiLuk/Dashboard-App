import type { Completion } from '@repo/types';

import { addDays, compareDates } from './date';

const MS_PER_DAY = 86_400_000;

export function goalProgress(
  start: string,
  end: string,
  habitIds: readonly string[],
  completions: readonly Completion[],
): number {
  if (compareDates(start, end) > 0) {
    return 0;
  }

  const linked = new Set(habitIds);
  const covered = new Set<string>();

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

    covered.add(completion.date);
  }

  const totalDays = inclusiveDayCount(start, end);
  return Math.round((covered.size / totalDays) * 100);
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
