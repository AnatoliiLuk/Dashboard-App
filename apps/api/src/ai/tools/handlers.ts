import type Anthropic from '@anthropic-ai/sdk';
import { addDays, compareDates, goalTimeline, streakFor } from '@repo/core';
import type { Completion, Habit } from '@repo/types';
import { ZodError, type ZodTypeAny, type z } from 'zod';

import { AppError } from '../../middleware/error.middleware';
import type { GoalRecord } from '../../repositories/goals.repository';
import type { CompletionsService } from '../../services/completions.service';
import type { GoalsService } from '../../services/goals.service';
import type { HabitsService } from '../../services/habits.service';
import { TOOL_NAMES } from './index';
import {
  getGoalsInput,
  getHabitHistoryInput,
  getHabitsInput,
  proposeHabitInput,
  type HabitProposal,
} from './schemas';

const RECENT_DAYS = 7;

export interface CoachToolContext {
  // Always from the session, never from the model.
  userId: string;
  today: string;
}

export interface CoachToolOutcome {
  result: Anthropic.ToolResultBlockParam;
  proposal?: HabitProposal;
}

export interface CoachToolRunner {
  run(
    block: Anthropic.ToolUseBlock,
    context: CoachToolContext,
  ): Promise<CoachToolOutcome>;
}

// Read-only slices of the existing services. Tools never write.
export interface CoachToolServices {
  habits: Pick<HabitsService, 'getAll' | 'getOne'>;
  completions: Pick<CompletionsService, 'getAll'>;
  goals: Pick<GoalsService, 'getAll'>;
}

type HabitRow = Awaited<ReturnType<HabitsService['getAll']>>[number];
type CompletionRow = Awaited<ReturnType<CompletionsService['getAll']>>[number];

interface ToolOutput {
  data: unknown;
  proposal?: HabitProposal;
}

class ToolInputError extends Error {}

export class CoachToolHandlers implements CoachToolRunner {
  constructor(private services: CoachToolServices) {}

  async run(
    block: Anthropic.ToolUseBlock,
    context: CoachToolContext,
  ): Promise<CoachToolOutcome> {
    try {
      const { data, proposal } = await this.dispatch(block, context);
      return {
        result: {
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(data),
        },
        proposal,
      };
    } catch (error) {
      // An error result lets the model recover instead of failing the chat.
      return {
        result: {
          type: 'tool_result',
          tool_use_id: block.id,
          content: toolErrorMessage(error),
          is_error: true,
        },
      };
    }
  }

  private dispatch(
    block: Anthropic.ToolUseBlock,
    context: CoachToolContext,
  ): Promise<ToolOutput> {
    switch (block.name) {
      case TOOL_NAMES.getHabits:
        parse(getHabitsInput, block.input);
        return this.getHabits(context);
      case TOOL_NAMES.getHabitHistory:
        return this.getHabitHistory(
          parse(getHabitHistoryInput, block.input),
          context,
        );
      case TOOL_NAMES.getGoals:
        parse(getGoalsInput, block.input);
        return this.getGoals(context);
      case TOOL_NAMES.proposeHabit:
        return Promise.resolve(
          proposeHabit(parse(proposeHabitInput, block.input)),
        );
      default:
        throw new ToolInputError(`Unknown tool: ${block.name}`);
    }
  }

  private async getHabits({ userId, today }: CoachToolContext) {
    const [habits, completions] = await Promise.all([
      this.services.habits.getAll(userId),
      this.services.completions.getAll(userId),
    ]);
    const active = habits.filter((habit) => !habit.archivedAt);
    const all = completions.map(toCompletion);

    return {
      data: {
        today,
        archivedHabitCount: habits.length - active.length,
        habits: active.map((row) => {
          const habit = toHabit(row);
          const streak = streakFor(habit, all, today);
          const done = new Set(
            all.filter((c) => c.habitId === habit.id).map((c) => c.date),
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
      },
    };
  }

  private async getHabitHistory(
    { habitId, days }: z.infer<typeof getHabitHistoryInput>,
    { userId, today }: CoachToolContext,
  ) {
    // getOne checks ownership: another user's habit is "not found".
    const habit = await this.services.habits.getOne(habitId, userId);
    const from = addDays(today, -(days - 1));
    const completedDates = habit.completions
      .map((row) => toCompletion(row).date)
      .filter(
        (date) =>
          compareDates(date, from) >= 0 && compareDates(date, today) <= 0,
      )
      .sort(compareDates);

    return {
      data: {
        habit: {
          id: habit.id,
          name: habit.name,
          createdOn: toHabit(habit).createdOn,
          archived: Boolean(habit.archivedAt),
        },
        from,
        to: today,
        days,
        completedCount: completedDates.length,
        completedDates,
      },
    };
  }

  private async getGoals({ userId, today }: CoachToolContext) {
    const [goals, habits, completions] = await Promise.all([
      this.services.goals.getAll(userId),
      this.services.habits.getAll(userId),
      this.services.completions.getAll(userId),
    ]);
    const habitNames = new Map(habits.map((habit) => [habit.id, habit.name]));
    const all = completions.map(toCompletion);
    const active = goals.filter((goal) => !goal.archivedAt);

    return {
      data: {
        today,
        archivedGoalCount: goals.length - active.length,
        goals: active.map((goal) => goalSummary(goal, habitNames, all, today)),
      },
    };
  }
}

function proposeHabit(proposal: HabitProposal): ToolOutput {
  return {
    data: {
      status: 'shown_to_user',
      note: 'The person sees a card and decides. Nothing is saved yet.',
    },
    proposal,
  };
}

function goalSummary(
  goal: GoalRecord,
  habitNames: Map<string, string>,
  completions: Completion[],
  today: string,
) {
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

  let status: 'upcoming' | 'active' | 'finished' = 'active';
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
function toHabit(row: Omit<HabitRow, 'completions'>): Habit {
  return {
    id: row.id,
    ownerId: row.userId,
    name: row.name,
    color: row.color,
    createdOn: toIsoDate(row.createdAt),
    archivedAt: row.archivedAt?.toISOString() ?? null,
  };
}

function toCompletion(row: CompletionRow): Completion {
  return {
    id: row.id,
    habitId: row.habitId,
    ownerId: row.userId,
    date: toIsoDate(row.completedAt),
  };
}

function parse<T extends ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  return schema.parse(input);
}

function toolErrorMessage(error: unknown): string {
  if (error instanceof ToolInputError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    const issues = error.errors
      .map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`)
      .join('; ');
    return `Invalid input. ${issues}`;
  }

  if (error instanceof AppError && error.statusCode < 500) {
    return error.message;
  }

  console.error('Coach tool failed:', error);
  return 'The tool failed. Answer without this data and say it is unavailable.';
}
