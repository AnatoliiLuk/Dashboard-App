export const SESSION_COOKIE = 'habits_plus_token';

const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

const WEEK_SECONDS = 7 * 24 * 60 * 60;

export type SessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax' | 'none';
  path: '/';
  maxAge: number;
};

export function expiresInSeconds(value: string): number {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    return WEEK_SECONDS;
  }

  return Number(match[1]) * UNIT_SECONDS[match[2]];
}

/**
 * SameSite=None is only sent by browsers on HTTPS, and they drop it on
 * http://localhost. Local sign-in uses Lax, which is still sent from the web
 * app to the API because both are localhost. Production uses None so a web
 * app on another host can send the cookie over HTTPS.
 */
export function sessionCookieOptions(
  expiresIn: string,
  secure: boolean,
): SessionCookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: expiresInSeconds(expiresIn) * 1000,
  };
}

export function clearCookieOptions(
  secure: boolean,
): Omit<SessionCookieOptions, 'maxAge'> {
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
  };
}

export function readSessionToken(
  cookieHeader: string | undefined,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    if (trimmed.slice(0, separator) !== SESSION_COOKIE) {
      continue;
    }

    return decodeURIComponent(trimmed.slice(separator + 1));
  }

  return undefined;
}

export function tokenFromSetCookie(
  header: string | string[] | undefined,
): string {
  const headers = Array.isArray(header) ? header : header ? [header] : [];
  const raw = headers.find((value) => value.startsWith(`${SESSION_COOKIE}=`));

  if (!raw) {
    throw new Error('Session cookie was not set');
  }

  const pair = raw.split(';')[0] ?? '';
  return decodeURIComponent(pair.slice(SESSION_COOKIE.length + 1));
}
