import { describe, expect, it } from '@jest/globals';

import { localeFromAcceptLanguage } from './locale';

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
  });
});
