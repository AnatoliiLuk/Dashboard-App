import { describe, expect, it, jest } from '@jest/globals';

const LEGACY_TOKEN_KEY = 'habits-plus-token';

describe('session', () => {
  it('removes a token left in localStorage and does not write one back', () => {
    window.localStorage.setItem(LEGACY_TOKEN_KEY, 'secret');

    jest.isolateModules(() => {
      const session = require('./session') as typeof import('./session');
      session.setSignedIn(true);
    });

    expect(window.localStorage.getItem(LEGACY_TOKEN_KEY)).toBeNull();
  });
});
