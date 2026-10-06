import { describe, expect, it } from '@jest/globals';

import { createHabitSchema, updateHabitSchema } from './habits.validator';

describe('createHabitSchema', () => {
  it('accepts a name and a known color', () => {
    expect(
      createHabitSchema.safeParse({ name: 'Read', color: 'sky' }).success,
    ).toBe(true);
  });

  it('rejects an empty name, a name over 100 characters, and an unknown color', () => {
    expect(
      createHabitSchema.safeParse({ name: '', color: 'sky' }).success,
    ).toBe(false);
    expect(
      createHabitSchema.safeParse({ name: 'a'.repeat(101), color: 'sky' })
        .success,
    ).toBe(false);
    expect(
      createHabitSchema.safeParse({ name: 'Read', color: 'blue' }).success,
    ).toBe(false);
  });
});

describe('updateHabitSchema', () => {
  it('accepts a name, a color, or both', () => {
    expect(updateHabitSchema.safeParse({ name: 'Walk' }).success).toBe(true);
    expect(updateHabitSchema.safeParse({ color: 'teal' }).success).toBe(true);
    expect(
      updateHabitSchema.safeParse({ name: 'Walk', color: 'teal' }).success,
    ).toBe(true);
  });

  it('rejects an empty update', () => {
    expect(updateHabitSchema.safeParse({}).success).toBe(false);
  });
});
