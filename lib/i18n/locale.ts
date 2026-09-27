export const LOCALES = ['en', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = 'habit-locale';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEFAULT_LOCALE: Locale = 'en';

export function parseLocale(value: string | undefined): Locale {
  return value === 'uk' ? 'uk' : DEFAULT_LOCALE;
}

export function intlLocale(locale: string): string {
  return locale === 'uk' ? 'uk-UA' : 'en-GB';
}
