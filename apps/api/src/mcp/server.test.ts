import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { AppError } from '../middleware/error.middleware';
import { createMcpServer, TODAY_RESOURCE_URI } from './server';
import type { McpServices } from './tools';

const TODAY = '2026-10-23';

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const reading = {
  id: 'habit-read',
  name: 'Reading',
  color: 'sky' as const,
  userId: 'user-a',
  archivedAt: null as Date | null,
  createdAt: day('2026-10-01'),
  updatedAt: day('2026-10-01'),
};

const archived = {
  ...reading,
  id: 'habit-old',
  name: 'Old habit',
  archivedAt: day('2026-10-10'),
};

// Reading: done 10-20..10-22, not yet today.
const completions = ['2026-10-20', '2026-10-21', '2026-10-22'].map(
  (date, index) => ({
    id: `completion-${index}`,
    habitId: reading.id,
    userId: 'user-a',
    completedAt: day(date),
    createdAt: day(date),
  }),
);

function services() {
  const rows = [reading, archived];
  return {
    habits: {
      getAll: jest.fn(async () => rows.map((row) => ({ ...row }))),
      getOne: jest.fn(async (id: string, userId: string) => {
        const row = rows.find((habit) => habit.id === id);
        if (!row || userId !== 'user-a') {
          throw new AppError(404, 'Habit not found');
        }
        return {
          ...row,
          completions: completions.filter((c) => c.habitId === id),
        };
      }),
      create: jest.fn(async (name: string, color: string, userId: string) => ({
        ...reading,
        id: 'habit-new',
        name,
        color,
        userId,
        createdAt: day(TODAY),
      })),
    },
    completions: {
      getAll: jest.fn(async () => completions),
      create: jest.fn(async () => completions[0]),
      removeForDate: jest.fn(async () => true),
    },
    goals: { getAll: jest.fn(async () => []) },
  };
}

let client: Client | undefined;

async function connect(deps = services(), userId = 'user-a') {
  const server = createMcpServer(
    { userId, today: () => TODAY },
    deps as unknown as McpServices,
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test-client', version: '1.0.0' });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return { client, deps };
}

async function call(
  name: string,
  args: Record<string, unknown> = {},
  deps = services(),
) {
  const { client } = await connect(deps);
  const result = (await client.callTool({
    name,
    arguments: args,
  })) as CallToolResult;
  const text = result.content[0]?.type === 'text' ? result.content[0].text : '';
  return {
    result,
    text,
    data: result.isError ? undefined : JSON.parse(text),
  };
}

afterEach(async () => {
  await client?.close();
  client = undefined;
});

describe('Habits+ MCP server', () => {
  it('lists the tools with annotations', async () => {
    const { client } = await connect();
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'create_habit',
      'get_habit_history',
      'list_goals',
      'list_habits',
      'log_habit',
      'unlog_habit',
    ]);
    const byName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
    expect(byName.list_habits.annotations?.readOnlyHint).toBe(true);
    expect(byName.unlog_habit.annotations?.destructiveHint).toBe(true);
    expect(byName.log_habit.inputSchema.required).toEqual(['habitId']);
  });

  it('list_habits returns active habits with streaks', async () => {
    const { data } = await call('list_habits');

    expect(data.today).toBe(TODAY);
    expect(data.archivedHabitCount).toBe(1);
    expect(data.habits).toEqual([
      expect.objectContaining({
        id: reading.id,
        currentStreak: 3,
        bestStreak: 3,
      }),
    ]);
  });

  it('get_habit_history scopes the lookup to the token user', async () => {
    const deps = services();
    const { data } = await call(
      'get_habit_history',
      { habitId: reading.id, days: 7 },
      deps,
    );

    expect(deps.habits.getOne).toHaveBeenCalledWith(reading.id, 'user-a');
    expect(data.completedDates).toEqual([
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
    ]);
  });

  it('log_habit logs today by default and returns the new streak', async () => {
    const deps = services();
    const { data } = await call('log_habit', { habitId: reading.id }, deps);

    expect(deps.completions.create).toHaveBeenCalledWith(
      reading.id,
      TODAY,
      'user-a',
    );
    expect(data).toEqual({
      status: 'logged',
      habit: { id: reading.id, name: 'Reading' },
      date: TODAY,
      currentStreak: 4,
      bestStreak: 4,
    });
  });

  it('log_habit is idempotent when the day is already logged', async () => {
    const deps = services();
    deps.completions.create.mockRejectedValueOnce(
      new AppError(409, 'Completion already exists for this date'),
    );

    const { data } = await call(
      'log_habit',
      { habitId: reading.id, date: '2026-10-22' },
      deps,
    );

    expect(data.status).toBe('already_logged');
    expect(data.currentStreak).toBe(3);
  });

  it.each([
    ['a future date', { habitId: reading.id, date: '2026-10-24' }, 'future'],
    [
      'a day before the habit existed',
      { habitId: reading.id, date: '2026-09-30' },
      'created on 2026-10-01',
    ],
    ['an archived habit', { habitId: archived.id }, 'archived'],
    ['an unknown habit', { habitId: 'nope' }, 'Habit not found'],
  ])('log_habit rejects %s', async (_case, args, message) => {
    const deps = services();
    const { result, text } = await call('log_habit', args, deps);

    expect(result.isError).toBe(true);
    expect(text).toContain(message);
    expect(deps.completions.create).not.toHaveBeenCalled();
  });

  it('rejects invalid input before reaching a service', async () => {
    const deps = services();
    const { result } = await call(
      'log_habit',
      { habitId: reading.id, date: '23/10/2026' },
      deps,
    );

    expect(result.isError).toBe(true);
    expect(deps.habits.getOne).not.toHaveBeenCalled();
  });

  it('unlog_habit reports whether anything was removed', async () => {
    const deps = services();
    deps.completions.removeForDate.mockResolvedValueOnce(false);

    const { data } = await call('unlog_habit', { habitId: reading.id }, deps);

    expect(deps.completions.removeForDate).toHaveBeenCalledWith(
      reading.id,
      TODAY,
      'user-a',
    );
    expect(data.status).toBe('not_logged');
  });

  it('create_habit trims the name and creates it for the token user', async () => {
    const deps = services();
    const { data } = await call(
      'create_habit',
      { name: '  Stretch  ', color: 'green' },
      deps,
    );

    expect(deps.habits.create).toHaveBeenCalledWith(
      'Stretch',
      'green',
      'user-a',
    );
    expect(data.habit).toEqual(
      expect.objectContaining({ name: 'Stretch', createdOn: TODAY }),
    );
  });

  it('hides unexpected errors from the model', async () => {
    const deps = services();
    deps.habits.getAll.mockRejectedValueOnce(new Error('db password=secret'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const { result, text } = await call('list_habits', {}, deps);

    expect(result.isError).toBe(true);
    expect(text).not.toContain('secret');
  });

  it('serves the today checklist as a resource', async () => {
    const { client } = await connect();
    const { resources } = await client.listResources();
    expect(resources.map((resource) => resource.uri)).toEqual([
      TODAY_RESOURCE_URI,
    ]);

    const { contents } = await client.readResource({
      uri: TODAY_RESOURCE_URI,
    });
    const checklist = JSON.parse(String(contents[0].text));

    expect(checklist).toEqual({
      date: TODAY,
      habits: [{ id: reading.id, name: 'Reading', done: false }],
    });
  });

  it('builds the weekly review prompt with an optional focus', async () => {
    const { client } = await connect();
    const { messages } = await client.getPrompt({
      name: 'weekly_review',
      arguments: { focus: 'sleep' },
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toEqual(
      expect.objectContaining({
        type: 'text',
        text: expect.stringContaining('Focus on: sleep.'),
      }),
    );
  });
});
