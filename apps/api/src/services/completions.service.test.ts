import { describe, expect, it, jest } from '@jest/globals';

import { AppError } from '../middleware/error.middleware';
import type { CompletionsRepository } from '../repositories/completions.repository';
import {
  CompletionsService,
  type CompletionsStore,
} from './completions.service';

const NOW = new Date('2026-11-07T12:00:00Z');

function completionRow(date: string) {
  return {
    id: `c-${date}`,
    habitId: 'habit-a',
    userId: 'user-a',
    completedAt: new Date(`${date}T00:00:00.000Z`),
    createdAt: NOW,
  };
}

function storeWith(overrides: Partial<CompletionsStore> = {}) {
  const store: CompletionsStore = {
    findAll: jest.fn<CompletionsRepository['findAll']>(),
    findById: jest.fn<CompletionsRepository['findById']>(),
    findByHabitAndDate: jest
      .fn<CompletionsRepository['findByHabitAndDate']>()
      .mockResolvedValue(null),
    create: jest
      .fn<CompletionsRepository['create']>()
      .mockImplementation(async ({ completedAt }) =>
        completionRow(completedAt.toISOString().slice(0, 10)),
      ),
    delete: jest.fn<CompletionsRepository['delete']>(),
    findHabitForUser: jest
      .fn<CompletionsRepository['findHabitForUser']>()
      .mockResolvedValue({
        createdAt: new Date('2026-11-01T18:30:00Z'),
        archivedAt: null,
      }),
    habitExistsForUser: jest
      .fn<CompletionsRepository['habitExistsForUser']>()
      .mockResolvedValue(true),
    ...overrides,
  };
  return store;
}

function serviceWith(store = storeWith()) {
  return { store, service: new CompletionsService(store, () => NOW) };
}

describe('CompletionsService.toggle', () => {
  it.each([
    ['yesterday', '2026-11-06'],
    ['the creation day', '2026-11-01'],
    ['tomorrow in UTC (users ahead of UTC)', '2026-11-08'],
  ])('logs %s', async (_case, date) => {
    const { store, service } = serviceWith();

    const result = await service.toggle('habit-a', date, 'user-a');

    expect(result.completed).toBe(true);
    expect(store.create).toHaveBeenCalledWith({
      habitId: 'habit-a',
      userId: 'user-a',
      completedAt: new Date(`${date}T00:00:00.000Z`),
    });
  });

  it.each([
    ['a future date', '2026-11-09', 400, 'future'],
    ['a day before the habit existed', '2026-10-31', 400, '2026-11-01'],
  ])('rejects %s', async (_case, date, status, message) => {
    const { store, service } = serviceWith();

    const result = service.toggle('habit-a', date, 'user-a');

    await expect(result).rejects.toMatchObject({
      statusCode: status,
      message: expect.stringContaining(message),
    });
    expect(store.create).not.toHaveBeenCalled();
  });

  it('rejects logging an archived habit', async () => {
    const { store, service } = serviceWith(
      storeWith({
        findHabitForUser: jest
          .fn<CompletionsRepository['findHabitForUser']>()
          .mockResolvedValue({
            createdAt: new Date('2026-11-01T00:00:00Z'),
            archivedAt: new Date('2026-11-05T00:00:00Z'),
          }),
      }),
    );

    await expect(
      service.toggle('habit-a', '2026-11-06', 'user-a'),
    ).rejects.toEqual(new AppError(409, 'Habit is archived'));
    expect(store.create).not.toHaveBeenCalled();
  });

  it('still undoes a day that is outside the loggable range', async () => {
    const { store, service } = serviceWith(
      storeWith({
        findByHabitAndDate: jest
          .fn<CompletionsRepository['findByHabitAndDate']>()
          .mockResolvedValue(completionRow('2026-10-01')),
      }),
    );

    const result = await service.toggle('habit-a', '2026-10-01', 'user-a');

    expect(result).toEqual({ completed: false, completion: null });
    expect(store.delete).toHaveBeenCalledWith('c-2026-10-01');
  });

  it('returns 404 for a habit the user does not own', async () => {
    const { service } = serviceWith(
      storeWith({
        habitExistsForUser: jest
          .fn<CompletionsRepository['habitExistsForUser']>()
          .mockResolvedValue(false),
      }),
    );

    await expect(
      service.toggle('habit-b', '2026-11-06', 'user-a'),
    ).rejects.toEqual(new AppError(404, 'Habit not found'));
  });
});

describe('CompletionsService.create', () => {
  it('applies the same date rules', async () => {
    const { store, service } = serviceWith();

    await expect(
      service.create('habit-a', '2026-10-31', 'user-a'),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(store.create).not.toHaveBeenCalled();
  });
});
