import { addDays, compareDates } from './dates';
import type { Completion, Habit, Streak } from './types';

export function streakFor(
  habit: Habit,
  completions: Completion[],
  today: string,
): Streak {
  const dates = new Set(
    completions
      .filter((completion) => completion.habitId === habit.id)
      .map((completion) => completion.date),
  );

  let best = 0;
  let run = 0;

  for (
    let day = habit.createdOn;
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
