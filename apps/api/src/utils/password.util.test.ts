import { describe, expect, it } from '@jest/globals';

import { comparePassword, hashPassword } from './password.util';

describe('password hashing', () => {
  it('stores a hash that matches the original password only', async () => {
    const hash = await hashPassword('long-enough');

    expect(hash).not.toBe('long-enough');
    expect(await comparePassword('long-enough', hash)).toBe(true);
    expect(await comparePassword('other-password', hash)).toBe(false);
  });
});
