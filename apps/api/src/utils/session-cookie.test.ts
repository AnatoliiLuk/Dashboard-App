import { describe, expect, it } from '@jest/globals';

import {
  SESSION_COOKIE,
  expiresInSeconds,
  readSessionToken,
  sessionCookieOptions,
  tokenFromSetCookie,
} from './session-cookie';

describe('expiresInSeconds', () => {
  it('reads the units the JWT expiry string uses', () => {
    expect(expiresInSeconds('7d')).toBe(7 * 24 * 60 * 60);
    expect(expiresInSeconds('12h')).toBe(12 * 60 * 60);
    expect(expiresInSeconds('30m')).toBe(30 * 60);
    expect(expiresInSeconds('45s')).toBe(45);
    expect(expiresInSeconds('90')).toBe(90);
  });

  it('falls back to a week for an unsupported value', () => {
    expect(expiresInSeconds('soon')).toBe(7 * 24 * 60 * 60);
  });
});

describe('sessionCookieOptions', () => {
  it('uses Lax without Secure so a local http login can keep the cookie', () => {
    expect(sessionCookieOptions('7d', false)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('uses None and Secure when the site is served over HTTPS', () => {
    expect(sessionCookieOptions('7d', true).sameSite).toBe('none');
    expect(sessionCookieOptions('7d', true).secure).toBe(true);
  });
});

describe('readSessionToken', () => {
  it('returns the session cookie and ignores the others', () => {
    expect(
      readSessionToken(`locale=uk; ${SESSION_COOKIE}=aaa.bbb.ccc; theme=dark`),
    ).toBe('aaa.bbb.ccc');
  });

  it('returns nothing when the session cookie is missing', () => {
    expect(readSessionToken(undefined)).toBeUndefined();
    expect(readSessionToken('locale=uk')).toBeUndefined();
  });
});

describe('tokenFromSetCookie', () => {
  it('reads the token from a Set-Cookie header', () => {
    expect(
      tokenFromSetCookie(
        `${SESSION_COOKIE}=aaa.bbb.ccc; Path=/; HttpOnly; Secure; SameSite=None`,
      ),
    ).toBe('aaa.bbb.ccc');
  });
});
