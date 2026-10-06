import { describe, expect, it } from '@jest/globals';

import { loginSchema, registerSchema } from './auth.validator';

const account = {
  email: 'ada@example.com',
  password: 'long-enough',
  name: 'Ada',
};

describe('registerSchema', () => {
  it('accepts an email, a password of 8 characters, and a name', () => {
    expect(registerSchema.safeParse(account).success).toBe(true);
  });

  it('rejects a short password, a bad email, and an empty name', () => {
    expect(
      registerSchema.safeParse({ ...account, password: 'short' }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...account, email: 'not-an-email' }).success,
    ).toBe(false);
    expect(registerSchema.safeParse({ ...account, name: '' }).success).toBe(
      false,
    );
  });
});

describe('loginSchema', () => {
  it('accepts any non-empty password', () => {
    expect(
      loginSchema.safeParse({ email: account.email, password: 'x' }).success,
    ).toBe(true);
  });

  it('rejects an empty password', () => {
    expect(
      loginSchema.safeParse({ email: account.email, password: '' }).success,
    ).toBe(false);
  });
});
