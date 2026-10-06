export const LOCALES = ['en', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = 'habit-locale';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

type RankedLanguage = {
  tag: string;
  quality: number;
};

function qualityFromParams(params: string[]): number {
  for (const param of params) {
    const [key, raw] = param.split('=');
    if (key?.trim() !== 'q') continue;
    const quality = Number(raw);
    return Number.isFinite(quality) ? quality : 0;
  }
  return 1;
}

function rankedLanguages(header: string): RankedLanguage[] {
  return header
    .split(',')
    .flatMap((entry) => {
      const [rawTag, ...params] = entry.split(';');
      const tag = rawTag?.trim().toLowerCase();
      if (!tag) return [];

      const quality = qualityFromParams(params);
      if (quality <= 0) return [];

      return [{ tag, quality }];
    })
    .sort((left, right) => right.quality - left.quality);
}

function matchLocale(tag: string): Locale | undefined {
  if (tag === '*') return DEFAULT_LOCALE;
  const primary = tag.split('-')[0];
  return LOCALES.find((locale) => locale === primary);
}

export function localeFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header) return DEFAULT_LOCALE;

  for (const { tag } of rankedLanguages(header)) {
    const locale = matchLocale(tag);
    if (locale) return locale;
  }

  return DEFAULT_LOCALE;
}
