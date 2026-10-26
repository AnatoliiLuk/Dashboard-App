import {
  summarizeGoals,
  summarizeHabits,
  type CoachDataServices,
  type GoalSummary,
  type HabitSummary,
} from './coach.data';

export interface CoachContextSource {
  build(userId: string, today: string): Promise<string>;
}

// A compact snapshot of the person's data for one request. Full history
// stays out: the model fetches it with get_habit_history when it needs it.
// No email, password hash or user id goes in here, only names and numbers.
export class CoachContextBuilder implements CoachContextSource {
  constructor(private services: CoachDataServices) {}

  async build(userId: string, today: string): Promise<string> {
    const [habitRows, completionRows, goalRows] = await Promise.all([
      this.services.habits.getAll(userId),
      this.services.completions.getAll(userId),
      this.services.goals.getAll(userId),
    ]);
    const { habits, archivedHabitCount } = summarizeHabits(
      habitRows,
      completionRows,
      today,
    );
    const { goals, archivedGoalCount } = summarizeGoals(
      goalRows,
      habitRows,
      completionRows,
      today,
    );

    return formatHabitData(
      habits,
      archivedHabitCount,
      goals,
      archivedGoalCount,
    );
  }
}

export function formatHabitData(
  habits: HabitSummary[],
  archivedHabitCount: number,
  goals: GoalSummary[],
  archivedGoalCount: number,
): string {
  const lines = [
    `Active habits: ${habits.length}${archivedLabel(archivedHabitCount)}`,
    ...habits.map(habitLine),
    `Active goals: ${goals.length}${archivedLabel(archivedGoalCount)}`,
    ...goals.map(goalLine),
  ];

  return `<habit_data>\n${lines.join('\n')}\n</habit_data>`;
}

function habitLine(habit: HabitSummary): string {
  const tracked = habit.last7Days.filter(
    ({ date }) => date >= habit.createdOn,
  ).length;
  const done = habit.last7Days.filter((day) => day.done).length;

  return (
    `- ${quote(habit.name)} (id ${habit.id}): current streak ${habit.currentStreak}, ` +
    `best ${habit.bestStreak}, done ${done} of the last ${tracked} tracked days`
  );
}

function goalLine(goal: GoalSummary): string {
  const habits = goal.habits.map(quote).join(', ');
  const progress =
    goal.status === 'upcoming'
      ? 'not started yet'
      : `day ${goal.day} of ${goal.totalDays}, ${goal.daysLeft} days left, ` +
        `${goal.completionsLogged} of ${goal.completionsPossible} completions (${goal.completionRatePercent}%)`;

  return `- ${quote(goal.name)} ${goal.startDate} to ${goal.endDate}: ${progress}; habits: ${habits}`;
}

function archivedLabel(count: number): string {
  return count ? ` (${count} archived, not listed)` : '';
}

// Names are typed by the person. Quoting them and removing angle brackets
// keeps a name from closing the <habit_data> tag or looking like markup.
function quote(name: string): string {
  return JSON.stringify(name.replace(/[<>]/g, ''));
}
