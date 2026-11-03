import { HabitColor } from '@prisma/client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
// The SDK's types import 'zod/v3'. Under moduleResolution "node", plain 'zod'
// resolves to separate declaration files that TypeScript cannot match, so the
// schemas passed to the SDK are built here rather than imported from validators.
import { z } from 'zod/v3';

import { HISTORY_MAX_DAYS } from '../ai/tools/schemas';
import { AppError } from '../middleware/error.middleware';
import { McpTools, type McpContext, type McpServices } from './tools';

export const MCP_SERVER_NAME = 'habits-plus';
export const MCP_SERVER_VERSION = '0.1.0';
export const TODAY_RESOURCE_URI = 'habits://today';

// Same rule as completionSchema.date.
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const INSTRUCTIONS =
  'Habits+ tracks daily habits and goals for one person. ' +
  'Call list_habits first to get habit ids; never guess an id. ' +
  'Dates are YYYY-MM-DD; omit date to mean today. ' +
  'Confirm with the person before create_habit or unlog_habit.';

// One server per authenticated user: every tool runs as context.userId.
export function createMcpServer(
  context: McpContext,
  services: McpServices,
): McpServer {
  const tools = new McpTools(services, context);
  // Tools outside the granted OAuth scopes are not registered at all, so the
  // model never sees them (ADR 0004). Personal tokens get every scope.
  const scopes = context.scopes ?? ['habits:read', 'habits:write'];
  const canRead = scopes.includes('habits:read');
  const canWrite = scopes.includes('habits:write');
  const server = new McpServer(
    { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
    { instructions: INSTRUCTIONS },
  );

  if (canRead) {
    server.registerTool(
      'list_habits',
      {
        title: 'List habits',
        description:
          'Lists active habits with id, name, color, creation date, current and best streak, and whether each was done on each of the last 7 days. ' +
          'Archived habits are not listed; only their count is returned.',
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      () => run(() => tools.listHabits()),
    );
  }

  if (canRead) {
    server.registerTool(
      'get_habit_history',
      {
        title: 'Habit history',
        description:
          'Returns the dates on which one habit was completed during the last N days, ending today. ' +
          'Use it for questions about a longer period, such as "how did Reading go this month?".',
        inputSchema: {
          habitId: z
            .string()
            .min(1)
            .max(100)
            .describe('Habit id from list_habits.'),
          days: z
            .number()
            .int()
            .min(1)
            .max(HISTORY_MAX_DAYS)
            .describe(
              `Days back to look, today included (1 to ${HISTORY_MAX_DAYS}).`,
            ),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      (input) => run(() => tools.habitHistory(input)),
    );
  }

  if (canRead) {
    server.registerTool(
      'list_goals',
      {
        title: 'List goals',
        description:
          'Lists active goals with dates, linked habits, which day of the goal it is, days left, and progress: completions logged, completions possible and the completion rate in percent.',
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      () => run(() => tools.listGoals()),
    );
  }

  if (canWrite) {
    server.registerTool(
      'log_habit',
      {
        title: 'Log a habit',
        description:
          'Marks a habit as done for one day and returns the new streak. ' +
          'Logging a day that is already logged changes nothing. ' +
          'Future days, days before the habit was created and archived habits are rejected.',
        inputSchema: {
          habitId: z
            .string()
            .min(1)
            .max(100)
            .describe('Habit id from list_habits.'),
          date: isoDateSchema
            .optional()
            .describe('Day to log, YYYY-MM-DD. Defaults to today.'),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      (input) => run(() => tools.logHabit(input)),
    );
  }

  if (canWrite) {
    server.registerTool(
      'unlog_habit',
      {
        title: 'Undo a habit log',
        description:
          'Removes the completion of a habit for one day, for example after a mistaken log_habit. ' +
          'Returns not_logged if that day was not logged.',
        inputSchema: {
          habitId: z
            .string()
            .min(1)
            .max(100)
            .describe('Habit id from list_habits.'),
          date: isoDateSchema
            .optional()
            .describe('Day to undo, YYYY-MM-DD. Defaults to today.'),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      (input) => run(() => tools.unlogHabit(input)),
    );
  }

  if (canWrite) {
    server.registerTool(
      'create_habit',
      {
        title: 'Create a habit',
        description:
          'Creates a new daily habit. Check list_habits first so you do not create a duplicate.',
        inputSchema: {
          name: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .describe('Short habit name, for example "Read 10 pages".'),
          color: z.nativeEnum(HabitColor).describe('Card color for the habit.'),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
        },
      },
      (input) => run(() => tools.createHabit(input)),
    );
  }

  if (canRead) {
    server.registerResource(
      'today',
      TODAY_RESOURCE_URI,
      {
        title: "Today's checklist",
        description: 'Each active habit and whether it is done today.',
        mimeType: 'application/json',
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(await tools.todayChecklist(), null, 2),
          },
        ],
      }),
    );
  }

  if (canRead) {
    server.registerPrompt(
      'weekly_review',
      {
        title: 'Weekly review',
        description:
          'Review the last 7 days of habits and goals and suggest one change.',
        argsSchema: {
          focus: z
            .string()
            .max(200)
            .optional()
            .describe('Optional area to focus on, for example "sleep".'),
        },
      },
      ({ focus }) => ({
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                'Review my last 7 days in Habits+. Call list_habits and list_goals, then: ' +
                '1) name what went well, with numbers; ' +
                '2) name the habit that slipped most and a likely reason; ' +
                '3) suggest one small, specific change for next week.' +
                (focus ? ` Focus on: ${focus}.` : '') +
                ' Keep it under 150 words.',
            },
          },
        ],
      }),
    );
  }

  return server;
}

async function run(handler: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    const data = await handler();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (error) {
    // An error result lets the model recover; internals stay in the log.
    return {
      content: [{ type: 'text', text: toolErrorMessage(error) }],
      isError: true,
    };
  }
}

function toolErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.statusCode < 500) {
    return error.message;
  }

  console.error('MCP tool failed:', error);
  return 'The tool failed. Tell the person Habits+ is unavailable right now.';
}
