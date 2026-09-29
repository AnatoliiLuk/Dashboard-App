import type { Completion, Habit, Streak } from '@repo/types';

import { addDays, compareDates } from './date';

export function streakFor(
  { id, createdOn }: Habit,
  completions: Completion[],
  today: string,
): Streak {
  const dates = new Set(
    completions.filter(({ habitId }) => habitId === id).map(({ date }) => date),
  );

  let best = 0;
  let run = 0;

  for (
    let day = createdOn;
    compareDates(day, today) <= 0;
    day = addDays(day, 1)
  ) {
    const done = dates.has(day);
    const stillOpen = day === today && !done;

    if (done) {
      run += 1;
      best = Math.max(best, run);
    } else if (!stillOpen) {
      run = 0;
    }
  }

  return { current: run, best };
}
