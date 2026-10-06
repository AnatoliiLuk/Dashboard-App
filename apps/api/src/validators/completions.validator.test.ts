import { describe, expect, it } from '@jest/globals';

import { completionSchema } from './completions.validator';

describe('completionSchema', () => {
  it('accepts a habit id and an iso date', () => {
    const result = completionSchema.safeParse({
      habitId: 'habit-1',
      date: '2026-10-06',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty habit id', () => {
    const result = completionSchema.safeParse({
      habitId: '',
      date: '2026-10-06',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a date that is not yyyy-mm-dd', () => {
    const result = completionSchema.safeParse({
      habitId: 'habit-1',
      date: '06-10-2026',
    });

    expect(result.success).toBe(false);
  });
});
