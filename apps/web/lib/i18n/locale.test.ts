import { describe, expect, it } from '@jest/globals';

import { isLocale, localeFromAcceptLanguage } from './locale';

describe('localeFromAcceptLanguage', () => {
  it('picks the first supported language', () => {
    expect(localeFromAcceptLanguage('uk-UA,uk;q=0.9,en;q=0.8')).toBe('uk');
  });

  it('keeps an explicit english preference ahead of ukrainian', () => {
    expect(localeFromAcceptLanguage('en-GB,en;q=0.9,uk;q=0.8')).toBe('en');
  });

  it('falls back to english when nothing matches', () => {
    expect(localeFromAcceptLanguage('de-DE,de;q=0.9')).toBe('en');
    expect(localeFromAcceptLanguage(null)).toBe('en');
    expect(localeFromAcceptLanguage('')).toBe('en');
  });

  it('uses quality order instead of list order', () => {
    expect(localeFromAcceptLanguage('en;q=0.1,uk;q=0.9')).toBe('uk');
  });

  it('skips a language the browser marked unacceptable', () => {
    expect(localeFromAcceptLanguage('uk;q=0,en;q=0.5')).toBe('en');
  });

  it('treats a wildcard as english before a lower-ranked language', () => {
    expect(localeFromAcceptLanguage('de,*;q=0.8,uk;q=0.2')).toBe('en');
  });
});

describe('isLocale', () => {
  it('accepts only the supported codes', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('uk')).toBe(true);
    expect(isLocale('uk-UA')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
