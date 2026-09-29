import type { TFunction } from 'i18next';

import type { HabitStatus } from './HabitCard.interface';

export function streakMessage(
  currentStreak: number,
  doneToday: boolean,
  translate: TFunction,
): { text: string; status: HabitStatus } {
  if (doneToday && currentStreak >= 7) {
    return { text: translate('streak.fullWeek'), status: 'success' };
  }
  if (doneToday && currentStreak > 1) {
    return {
      text: translate('streak.days', { count: currentStreak }),
      status: 'success',
    };
  }
  if (doneToday) {
    return { text: translate('streak.done'), status: 'success' };
  }
  if (currentStreak > 0) {
    return {
      text: translate('streak.open', { count: currentStreak }),
      status: 'warning',
    };
  }
  return { text: translate('streak.start'), status: 'info' };
}
