import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import {
  emailField,
  loginFormSchema,
  normalizeEmail,
  registerFormSchema,
} from './schemas';

// Returning the key keeps the messages checkable without loading i18n.
const t = ((key: string) => key) as unknown as TFunction;

const MAX_EMAIL_LENGTH = 254;
const emailOfLength = (length: number) =>
  `${'a'.repeat(length - '@example.com'.length)}@example.com`;

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Ada@Example.COM  ')).toBe('ada@example.com');
  });
});

describe('emailField', () => {
  const schema = emailField(t);

  it('trims and lowercases the address', () => {
    const result = schema.safeParse('  Ada@Example.COM  ');

    expect(result.success).toBe(true);
    expect(result.data).toBe('ada@example.com');
  });

  it('agrees with normalizeEmail', () => {
    const raw = '  Countess@Example.com ';

    expect(schema.parse(raw)).toBe(normalizeEmail(raw));
  });

  it('rejects an empty or blank address', () => {
    expect(schema.safeParse('').success).toBe(false);
    expect(schema.safeParse('   ').success).toBe(false);
  });

  it('rejects an invalid address with the email message', () => {
    const result = schema.safeParse('not-an-email');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.email');
  });

  it('accepts exactly 254 characters and rejects 255', () => {
    expect(schema.safeParse(emailOfLength(MAX_EMAIL_LENGTH)).success).toBe(
      true,
    );
    expect(schema.safeParse(emailOfLength(MAX_EMAIL_LENGTH + 1)).success).toBe(
      false,
    );
  });
});

describe('forms that take an email', () => {
  it('login and register lowercase it like the profile form', () => {
    const login = loginFormSchema(t).parse({
      email: ' Ada@Example.com ',
      password: 'secret',
    });
    const register = registerFormSchema(t).parse({
      name: 'Ada',
      email: ' Ada@Example.com ',
      password: 'long-enough',
    });

    expect(login.email).toBe('ada@example.com');
    expect(register.email).toBe('ada@example.com');
  });
});
