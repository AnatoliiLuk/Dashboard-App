import { describe, expect, it, jest } from '@jest/globals';
import type Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../../middleware/error.middleware';
import { CoachToolHandlers, type CoachToolServices } from './handlers';

const context = { userId: 'user-a', today: '2026-10-23' };

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const reading = {
  id: 'habit-read',
  name: 'Reading',
  color: 'sky' as const,
  userId: 'user-a',
  archivedAt: null,
  createdAt: day('2026-10-01'),
  updatedAt: day('2026-10-01'),
};

const archived = {
  ...reading,
  id: 'habit-old',
  name: 'Old habit',
  archivedAt: day('2026-10-10'),
};

// Reading: done 10-17..10-19 (3) and 10-20..10-23 (4, through today).
const readingDates = [
  '2026-10-17',
  '2026-10-18',
  '2026-10-19',
  '2026-10-20',
  '2026-10-21',
  '2026-10-22',
  '2026-10-23',
  '2026-10-02',
];

const completions = readingDates.map((date, index) => ({
  id: `completion-${index}`,
  habitId: reading.id,
  userId: 'user-a',
  completedAt: day(date),
  createdAt: day(date),
}));

const goal = {
  id: 'goal-1',
  name: 'October focus',
  color: 'indigo' as const,
  startDate: '2026-10-20',
  endDate: '2026-10-29',
  userId: 'user-a',
  habitIds: [reading.id],
  archivedAt: null,
};

function services(overrides: Partial<CoachToolServices> = {}) {
  return {
    habits: {
      getAll: jest.fn(async () => [
        { ...reading, completions: [] },
        { ...archived, completions: [] },
      ]),
      getOne: jest.fn(async (id: string, userId: string) => {
        if (id !== reading.id || userId !== 'user-a') {
          throw new AppError(404, 'Habit not found');
        }
        return { ...reading, completions };
      }),
    },
    completions: { getAll: jest.fn(async () => completions) },
    goals: { getAll: jest.fn(async () => [goal]) },
    ...overrides,
  } as unknown as CoachToolServices;
}

function block(name: string, input: unknown = {}): Anthropic.ToolUseBlock {
  return {
    type: 'tool_use',
    id: 'toolu_1',
    name,
    input,
  } as Anthropic.ToolUseBlock;
}

async function run(name: string, input?: unknown, deps = services()) {
  const outcome = await new CoachToolHandlers(deps).run(
    block(name, input),
    context,
  );
  return {
    ...outcome,
    data: outcome.result.is_error
      ? undefined
      : JSON.parse(outcome.result.content as string),
  };
}

describe('CoachToolHandlers', () => {
  it('get_habits returns active habits with streaks from @repo/core', async () => {
    const { result, data } = await run('get_habits');

    expect(result.tool_use_id).toBe('toolu_1');
    expect(result.is_error).toBeUndefined();
    expect(data.archivedHabitCount).toBe(1);
    expect(data.habits).toHaveLength(1);
    expect(data.habits[0]).toEqual(
      expect.objectContaining({
        id: reading.id,
        name: 'Reading',
        createdOn: '2026-10-01',
        currentStreak: 7,
        bestStreak: 7,
      }),
    );
    expect(data.habits[0].last7Days).toHaveLength(7);
    expect(data.habits[0].last7Days.at(-1)).toEqual({
      date: '2026-10-23',
      done: true,
    });
  });

  it('get_habit_history returns completed dates inside the window only', async () => {
    const { data } = await run('get_habit_history', {
      habitId: reading.id,
      days: 3,
    });

    expect(data.from).toBe('2026-10-21');
    expect(data.to).toBe('2026-10-23');
    expect(data.completedDates).toEqual([
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
    ]);
    expect(data.completedCount).toBe(3);
  });

  it('get_habit_history checks ownership with the session user id', async () => {
    const deps = services();
    const { result } = await run(
      'get_habit_history',
      { habitId: 'habit-of-user-b', days: 7 },
      deps,
    );

    expect(deps.habits.getOne).toHaveBeenCalledWith(
      'habit-of-user-b',
      'user-a',
    );
    expect(result.is_error).toBe(true);
    expect(result.content).toBe('Habit not found');
  });

  it('get_goals returns progress so far', async () => {
    const { data } = await run('get_goals');

    expect(data.goals).toEqual([
      expect.objectContaining({
        name: 'October focus',
        status: 'active',
        habits: ['Reading'],
        day: 4,
        totalDays: 10,
        daysLeft: 7,
        completionsLogged: 4,
        completionsPossible: 4,
        completionRatePercent: 100,
      }),
    ]);
  });

  it('propose_habit returns a valid proposal and saves nothing', async () => {
    const deps = services();
    const outcome = await run(
      'propose_habit',
      { name: ' Read 10 pages ', color: 'sky', reason: 'Small and easy.' },
      deps,
    );

    expect(outcome.proposal).toEqual({
      name: 'Read 10 pages',
      color: 'sky',
      reason: 'Small and easy.',
    });
    expect(outcome.data.status).toBe('shown_to_user');
  });

  it('rejects a proposal with a color the app does not have', async () => {
    const outcome = await run('propose_habit', {
      name: 'Run',
      color: 'black',
      reason: 'Fitness.',
    });

    expect(outcome.result.is_error).toBe(true);
    expect(outcome.result.content).toMatch(/^Invalid input/);
    expect(outcome.proposal).toBeUndefined();
  });

  it('returns an error result for invalid input', async () => {
    const { result } = await run('get_habit_history', {
      habitId: reading.id,
      days: 365,
    });

    expect(result.is_error).toBe(true);
    expect(result.content).toMatch(/^Invalid input. days/);
  });

  it('returns an error result for an unknown tool', async () => {
    const { result } = await run('delete_habit', { habitId: reading.id });

    expect(result.is_error).toBe(true);
    expect(result.content).toBe('Unknown tool: delete_habit');
  });

  it('hides internal errors when a tool throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const deps = services({
      goals: {
        getAll: jest.fn(async () => {
          throw new Error('connection refused at 10.0.0.5');
        }),
      } as unknown as CoachToolServices['goals'],
    });

    const { result } = await run('get_goals', {}, deps);

    expect(result.is_error).toBe(true);
    expect(result.content).not.toContain('10.0.0.5');
    expect(result.content).toMatch(/tool failed/);
  });
});
