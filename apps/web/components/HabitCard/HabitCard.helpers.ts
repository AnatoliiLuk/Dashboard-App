import type { TFunction } from 'i18next';

import { WEEKDAYS } from '@/lib/habits/calendar';

import type { HabitStatus } from './HabitCard.interface';

export function weekdayInitial(iso: string, translate: TFunction): string {
  const [year, month, day] = iso.split('-').map(Number);
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const key = WEEKDAYS[(jsDay + 6) % 7];
  return translate(`calendar.weekdays.${key}`).charAt(0);
}

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
