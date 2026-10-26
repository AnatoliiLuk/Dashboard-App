import { describe, expect, it, jest } from '@jest/globals';

import { AppError } from '../../middleware/error.middleware';
import { billableTokens, DailyTokenBudget } from './token-budget';

function store(used: number) {
  return {
    billableTokensSince: jest.fn(async (_userId: string, _since: Date) => used),
  };
}

const now = () => new Date('2026-10-26T15:30:00Z');

describe('billableTokens', () => {
  it('counts input, cache writes and output, but not cache reads', () => {
    expect(
      billableTokens({
        inputTokens: 10,
        outputTokens: 100,
        cacheReadTokens: 5000,
        cacheWriteTokens: 400,
      }),
    ).toBe(510);
  });
});

describe('DailyTokenBudget', () => {
  it('blocks a user who used up the daily budget, with a 429', async () => {
    const budget = new DailyTokenBudget(store(1000), 1000, now);

    const error = await budget
      .assertAvailable('user-a')
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(429);
  });

  it('allows requests under the budget', async () => {
    const budget = new DailyTokenBudget(store(999), 1000, now);

    await expect(budget.assertAvailable('user-a')).resolves.toBeUndefined();
  });

  it('counts the user’s usage since midnight UTC', async () => {
    const usage = store(0);
    const budget = new DailyTokenBudget(usage, 1000, now);

    await budget.assertAvailable('user-a');

    expect(usage.billableTokensSince).toHaveBeenCalledWith(
      'user-a',
      new Date('2026-10-26T00:00:00Z'),
    );
  });
});
