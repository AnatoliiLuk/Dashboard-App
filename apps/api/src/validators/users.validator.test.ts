import { describe, expect, it } from '@jest/globals';

import { changePasswordSchema, updateProfileSchema } from './users.validator';

describe('updateProfileSchema', () => {
  it('accepts a name on its own and trims it', () => {
    const result = updateProfileSchema.safeParse({ name: '  Ada  ' });

    expect(result.success && result.data).toEqual({ name: 'Ada' });
  });

  it('accepts an email with the current password and lowercases it', () => {
    const result = updateProfileSchema.safeParse({
      email: ' Ada@Example.COM ',
      currentPassword: 'long-enough',
    });

    expect(result.success && result.data).toEqual({
      email: 'ada@example.com',
      currentPassword: 'long-enough',
    });
  });

  it('rejects a body with neither name nor email', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
    expect(
      updateProfileSchema.safeParse({ currentPassword: 'long-enough' }).success,
    ).toBe(false);
  });

  it('rejects a name of only spaces or over 100 characters', () => {
    expect(updateProfileSchema.safeParse({ name: '   ' }).success).toBe(false);
    expect(
      updateProfileSchema.safeParse({ name: 'a'.repeat(101) }).success,
    ).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(
      updateProfileSchema.safeParse({ email: 'not-an-email' }).success,
    ).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('accepts a current password and a new one of 8 to 128 characters', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'x',
        newPassword: 'a'.repeat(8),
      }).success,
    ).toBe(true);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'x',
        newPassword: 'a'.repeat(128),
      }).success,
    ).toBe(true);
  });

  it('rejects a new password outside 8 to 128 characters', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'x',
        newPassword: 'a'.repeat(7),
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'x',
        newPassword: 'a'.repeat(129),
      }).success,
    ).toBe(false);
  });

  it('requires the current password', () => {
    expect(
      changePasswordSchema.safeParse({ newPassword: 'brand-new-secret' })
        .success,
    ).toBe(false);
  });
});
