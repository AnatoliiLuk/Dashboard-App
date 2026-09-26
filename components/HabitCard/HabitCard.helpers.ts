export type HabitStatus = 'success' | 'warning' | 'info';

export function streakMessage(
  currentStreak: number,
  doneToday: boolean,
): { text: string; status: HabitStatus } {
  if (doneToday && currentStreak >= 7) {
    return { text: 'A full week in a row.', status: 'success' };
  }
  if (doneToday && currentStreak > 1) {
    return { text: `${currentStreak} days in a row.`, status: 'success' };
  }
  if (doneToday) {
    return { text: 'Nice. Today is done.', status: 'success' };
  }
  if (currentStreak > 0) {
    return {
      text: `${currentStreak} days in a row. Today is still open.`,
      status: 'warning',
    };
  }
  return { text: 'Do it today to start a streak.', status: 'info' };
}
