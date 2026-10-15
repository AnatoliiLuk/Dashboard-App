import { describe, expect, it } from '@jest/globals';

import { createGoalSchema, updateGoalSchema } from './goals.validator';

const goal = {
  name: 'October focus',
  color: 'indigo',
  startDate: '2026-10-01',
  endDate: '2026-10-10',
  habitIds: ['habit-1', 'habit-2', 'habit-3', 'habit-4'],
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

  it('rejects a fifth habit', () => {
    const result = createGoalSchema.safeParse({
      ...goal,
      habitIds: ['habit-1', 'habit-2', 'habit-3', 'habit-4', 'habit-5'],
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
  it('rejects a start date after the end date', () => {
    const result = updateGoalSchema.safeParse({
      startDate: '2026-10-11',
      endDate: '2026-10-01',
    });

    expect(result.success).toBe(false);
  });
});
