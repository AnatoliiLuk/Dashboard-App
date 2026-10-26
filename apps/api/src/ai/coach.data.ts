import { addDays, compareDates, goalTimeline, streakFor } from '@repo/core';
import type { Completion, Habit } from '@repo/types';

import type { GoalRecord } from '../repositories/goals.repository';
import type { CompletionsService } from '../services/completions.service';
import type { GoalsService } from '../services/goals.service';
import type { HabitsService } from '../services/habits.service';

// Shared by the tools and the context builder, so both report the same
// numbers. Streaks and goal progress come from @repo/core, like the web app.

export const RECENT_DAYS = 7;

// Read-only slices of the existing services. The coach never writes.
export interface CoachDataServices {
  habits: Pick<HabitsService, 'getAll' | 'getOne'>;
  completions: Pick<CompletionsService, 'getAll'>;
  goals: Pick<GoalsService, 'getAll'>;
}

export type HabitRow = Awaited<ReturnType<HabitsService['getAll']>>[number];
export type CompletionRow = Awaited<
  ReturnType<CompletionsService['getAll']>
>[number];

export interface HabitSummary {
  id: string;
  name: string;
  color: Habit['color'];
  createdOn: string;
  currentStreak: number;
  bestStreak: number;
  last7Days: { date: string; done: boolean }[];
}

export interface GoalSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'finished';
  habits: string[];
  day: number;
  totalDays: number;
  daysLeft: number;
  completionsLogged: number;
  completionsPossible: number;
  completionRatePercent: number;
}

export function summarizeHabits(
  habitRows: Omit<HabitRow, 'completions'>[],
  completionRows: CompletionRow[],
  today: string,
): { habits: HabitSummary[]; archivedHabitCount: number } {
  const active = habitRows.filter((row) => !row.archivedAt);
  const completions = completionRows.map(toCompletion);

  return {
    archivedHabitCount: habitRows.length - active.length,
    habits: active.map((row) => {
      const habit = toHabit(row);
      const streak = streakFor(habit, completions, today);
      const done = new Set(
        completions.filter((c) => c.habitId === habit.id).map((c) => c.date),
      );

      return {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        createdOn: habit.createdOn,
        currentStreak: streak.current,
        bestStreak: streak.best,
        last7Days: recentDates(today).map((date) => ({
          date,
          // Same rule as the web log: days before creation never count.
          done: compareDates(date, habit.createdOn) >= 0 && done.has(date),
        })),
      };
    }),
  };
}

export function summarizeGoals(
  goals: GoalRecord[],
  habitRows: Omit<HabitRow, 'completions'>[],
  completionRows: CompletionRow[],
  today: string,
): { goals: GoalSummary[]; archivedGoalCount: number } {
  const habitNames = new Map(habitRows.map((row) => [row.id, row.name]));
  const completions = completionRows.map(toCompletion);
  const active = goals.filter((goal) => !goal.archivedAt);

  return {
    archivedGoalCount: goals.length - active.length,
    goals: active.map((goal) =>
      goalSummary(goal, habitNames, completions, today),
    ),
  };
}

function goalSummary(
  goal: GoalRecord,
  habitNames: Map<string, string>,
  completions: Completion[],
  today: string,
): GoalSummary {
  const timeline = goalTimeline(
    goal.startDate,
    goal.endDate,
    goal.habitIds,
    completions,
    today,
  );
  const elapsed = timeline.days.filter((day) => day.state !== 'future');
  const logged = elapsed.reduce((sum, day) => sum + day.logged, 0);
  const possible = elapsed.length * goal.habitIds.length;

  let status: GoalSummary['status'] = 'active';
  if (compareDates(today, goal.startDate) < 0) {
    status = 'upcoming';
  } else if (compareDates(today, goal.endDate) > 0) {
    status = 'finished';
  }

  return {
    id: goal.id,
    name: goal.name,
    startDate: goal.startDate,
    endDate: goal.endDate,
    status,
    habits: goal.habitIds.map((id) => habitNames.get(id) ?? 'Unknown habit'),
    day: timeline.day,
    totalDays: timeline.total,
    daysLeft: timeline.left,
    completionsLogged: logged,
    completionsPossible: possible,
    completionRatePercent: possible ? Math.round((logged / possible) * 100) : 0,
  };
}

function recentDates(today: string): string[] {
  return Array.from({ length: RECENT_DAYS }, (_, index) =>
    addDays(today, index - (RECENT_DAYS - 1)),
  );
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

// Same mapping as the web app, so the coach and the UI agree on streaks.
export function toHabit(row: Omit<HabitRow, 'completions'>): Habit {
  return {
    id: row.id,
    ownerId: row.userId,
    name: row.name,
    color: row.color,
    createdOn: toIsoDate(row.createdAt),
    archivedAt: row.archivedAt?.toISOString() ?? null,
  };
}

export function toCompletion(row: CompletionRow): Completion {
  return {
    id: row.id,
    habitId: row.habitId,
    ownerId: row.userId,
    date: toIsoDate(row.completedAt),
  };
}
