import type { Completion } from '@repo/types';

import { addDays, compareDates } from './date';

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

  let totalDays = 0;

  for (let day = start; compareDates(day, end) <= 0; day = addDays(day, 1)) {
    totalDays += 1;
  }

  return Math.round((covered.size / totalDays) * 100);
}
