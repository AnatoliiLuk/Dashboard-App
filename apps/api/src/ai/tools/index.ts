import type Anthropic from '@anthropic-ai/sdk';
import { HabitColor } from '@prisma/client';

import { HISTORY_MAX_DAYS } from './schemas';

export const TOOL_NAMES = {
  getHabits: 'get_habits',
  getHabitHistory: 'get_habit_history',
  getGoals: 'get_goals',
  proposeHabit: 'propose_habit',
} as const;

// Tool descriptions are prompts: they decide when the model calls a tool.
// Changing them changes behaviour, so bump COACH_PROMPT_VERSION too.
export const COACH_TOOLS: Anthropic.Tool[] = [
  {
    name: TOOL_NAMES.getHabits,
    description:
      "Lists the person's active habits. For each habit it returns the id, name, color, the date it was created, the current streak, the best streak, and whether it was done on each of the last 7 days. " +
      'The <habit_data> snapshot already has these streaks and 7-day counts, so call this only when you need the exact days of the last week. ' +
      'Archived habits are not listed; only their count is returned.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: TOOL_NAMES.getHabitHistory,
    description:
      'Returns the dates on which one habit was completed during the last N days, ending today. ' +
      'Use it for questions about a longer period or specific days, such as "how did Reading go this month?". ' +
      `Take the habit id from <habit_data>. days must be between 1 and ${HISTORY_MAX_DAYS}. ` +
      'Returns "Habit not found" for an unknown id.',
    input_schema: {
      type: 'object',
      properties: {
        habitId: {
          type: 'string',
          description: 'The habit id from <habit_data> or get_habits.',
        },
        days: {
          type: 'integer',
          description: `How many days back to look, today included (1 to ${HISTORY_MAX_DAYS}).`,
        },
      },
      required: ['habitId', 'days'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: TOOL_NAMES.getGoals,
    description:
      "Lists the person's active goals. For each goal it returns the name, dates, linked habits, which day of the goal it is, days left, and progress so far: completions logged, completions possible, and the completion rate in percent. " +
      'The <habit_data> snapshot already has this progress, so call this only if you need it again later in a long conversation.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: TOOL_NAMES.proposeHabit,
    description:
      'Shows the person a card suggesting a new habit, which they can accept or dismiss. It does not create the habit. ' +
      'Use it only when the person wants to start a new habit or agrees to your suggestion, and only for a habit they do not already have. ' +
      'Propose at most one habit per reply. After calling it, tell them in one sentence that they can add it from the card.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Short habit name in the language of the conversation, at most 100 characters, for example "Read 10 pages".',
        },
        color: {
          type: 'string',
          enum: Object.values(HabitColor),
          description: 'Card color for the habit.',
        },
        reason: {
          type: 'string',
          description:
            'One sentence on why this habit helps, shown on the card, at most 300 characters.',
        },
      },
      required: ['name', 'color', 'reason'],
      additionalProperties: false,
    },
    strict: true,
  },
];
