import { describe, expect, it } from '@jest/globals';

import { AppError } from '../../middleware/error.middleware';
import { billableTokens, InMemoryTokenBudget } from './token-budget';

const usage = (tokens: number) => ({
  inputTokens: 0,
  outputTokens: tokens,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
});

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

describe('InMemoryTokenBudget', () => {
  it('blocks a user who used up the daily budget, with a 429', () => {
    const budget = new InMemoryTokenBudget(1000);
    budget.record('user-a', usage(1000));

    let error: unknown;
    try {
      budget.assertAvailable('user-a');
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(429);
  });

  it('keeps each user separate', () => {
    const budget = new InMemoryTokenBudget(1000);
    budget.record('user-a', usage(5000));

    expect(() => budget.assertAvailable('user-b')).not.toThrow();
  });

  it('allows requests under the budget', () => {
    const budget = new InMemoryTokenBudget(1000);
    budget.record('user-a', usage(999));

    expect(() => budget.assertAvailable('user-a')).not.toThrow();
  });

  it('resets on a new UTC day', () => {
    let now = new Date('2026-10-26T23:59:00Z');
    const budget = new InMemoryTokenBudget(1000, () => now);
    budget.record('user-a', usage(1000));

    now = new Date('2026-10-27T00:01:00Z');

    expect(() => budget.assertAvailable('user-a')).not.toThrow();
  });
});
