import type Anthropic from '@anthropic-ai/sdk';
import { addDays, compareDates } from '@repo/core';
import { ZodError, type ZodTypeAny, type z } from 'zod';

import { AppError } from '../../middleware/error.middleware';
import {
  summarizeGoals,
  summarizeHabits,
  toCompletion,
  toHabit,
  type CoachDataServices,
} from '../coach.data';
import { TOOL_NAMES } from './index';
import {
  getGoalsInput,
  getHabitHistoryInput,
  getHabitsInput,
  proposeHabitInput,
  type HabitProposal,
} from './schemas';

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

export type CoachToolServices = CoachDataServices;

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
    return { data: { today, ...summarizeHabits(habits, completions, today) } };
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
    return {
      data: { today, ...summarizeGoals(goals, habits, completions, today) },
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
