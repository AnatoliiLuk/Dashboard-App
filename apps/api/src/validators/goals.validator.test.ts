import { describe, expect, it } from '@jest/globals';
import { MAX_GOAL_HABITS } from '@repo/core';

import { createGoalSchema, updateGoalSchema } from './goals.validator';

const habitIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `habit-${index + 1}`);

const goal = {
  name: 'October focus',
  color: 'indigo',
  startDate: '2026-10-01',
  endDate: '2026-10-10',
  habitIds: habitIds(4),
};

describe('createGoalSchema', () => {
  it('accepts four habits when the start is on or before the end', () => {
    expect(createGoalSchema.safeParse(goal).success).toBe(true);
    expect(
      createGoalSchema.safeParse({
        ...goal,
        startDate: '2026-10-10',
        endDate: '2026-10-10',
        habitIds: ['habit-1'],
      }).success,
    ).toBe(true);
  });

  it('accepts more than four habits up to the limit', () => {
    expect(
      createGoalSchema.safeParse({
        ...goal,
        habitIds: habitIds(MAX_GOAL_HABITS),
      }).success,
    ).toBe(true);
  });

  it('rejects habits beyond the limit', () => {
    const result = createGoalSchema.safeParse({
      ...goal,
      habitIds: habitIds(MAX_GOAL_HABITS + 1),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a start date after the end date', () => {
    const result = createGoalSchema.safeParse({
      ...goal,
      startDate: '2026-10-11',
      endDate: '2026-10-01',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown goal color', () => {
    const result = createGoalSchema.safeParse({
      ...goal,
      color: 'sky',
    });

    expect(result.success).toBe(false);
  });

  it('rejects duplicate habit ids', () => {
    const result = createGoalSchema.safeParse({
      ...goal,
      habitIds: ['habit-1', 'habit-1'],
    });

    expect(result.success).toBe(false);
  });
});

describe('updateGoalSchema', () => {
  it('accepts archiving on its own', () => {
    expect(updateGoalSchema.safeParse({ archived: true }).success).toBe(true);
  });

  it('rejects a start date after the end date', () => {
    const result = updateGoalSchema.safeParse({
      startDate: '2026-10-11',
      endDate: '2026-10-01',
    });

    expect(result.success).toBe(false);
  });
});
