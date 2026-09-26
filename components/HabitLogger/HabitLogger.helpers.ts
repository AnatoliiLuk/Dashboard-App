export function streakMessage(
  currentStreak: number,
  doneToday: boolean,
): string {
  if (doneToday && currentStreak >= 7) {
    return 'A full week in a row.';
  }
  if (doneToday && currentStreak > 1) {
    return `${currentStreak} days in a row.`;
  }
  if (doneToday) {
    return 'Nice. Today is done.';
  }
  if (currentStreak > 0) {
    return `${currentStreak} days in a row. Today is still open.`;
  }
  return 'Do it today to start a streak.';
}
