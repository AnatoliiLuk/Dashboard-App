import { afterEach, describe, expect, it, jest } from '@jest/globals';

import {
  addDays,
  addMonths,
  compareDates,
  formatDateRange,
  formatDisplay,
  monthTitle,
  startOfMonth,
  startOfWeek,
  today,
  weekTitle,
} from './date';

afterEach(() => {
  jest.useRealTimers();
});

/** CLDR punctuation differs between Node builds, so expect Intl's own text. */
function expectedDisplay(iso: string, locale?: string): string {
  return displayFormatter(locale).format(utcDate(iso));
}

function expectedRange(start: string, end: string, locale: string): string {
  return displayFormatter(locale).formatRange(utcDate(start), utcDate(end));
}

function displayFormatter(locale: string | undefined): Intl.DateTimeFormat {
  const tag = locale === 'uk' ? 'uk-UA' : 'en-GB';
  return new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function utcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

describe('compareDates', () => {
  it('orders an earlier date first', () => {
    expect(compareDates('2026-01-01', '2026-01-02')).toBe(-1);
  });

  it('orders a later date second', () => {
    expect(compareDates('2026-01-02', '2026-01-01')).toBe(1);
  });

  it('treats the same date as equal', () => {
    expect(compareDates('2026-01-01', '2026-01-01')).toBe(0);
  });
});

describe('today', () => {
  it('returns the local calendar day', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 6, 23, 30, 0));

    expect(today()).toBe('2026-10-06');
  });
});

describe('formatDisplay', () => {
  it('uses a short month name for the locale', () => {
    expect(formatDisplay('2026-10-15', 'en')).toBe(
      expectedDisplay('2026-10-15', 'en'),
    );
    expect(formatDisplay('2026-10-15', 'uk')).toBe(
      expectedDisplay('2026-10-15', 'uk'),
    );
    expect(formatDisplay('2026-10-15', 'uk')).not.toBe(
      formatDisplay('2026-10-15', 'en'),
    );
  });

  it('uses english when the locale is missing', () => {
    expect(formatDisplay('2026-10-15')).toBe(expectedDisplay('2026-10-15'));
  });
});

describe('formatDateRange', () => {
  it('collapses a single day into one date', () => {
    expect(formatDateRange('2026-10-15', '2026-10-15', 'en')).toBe(
      formatDisplay('2026-10-15', 'en'),
    );
    expect(formatDateRange('2026-10-15', '2026-10-15', 'uk')).toBe(
      formatDisplay('2026-10-15', 'uk'),
    );
  });

  it('keeps both ends when the stretch is longer', () => {
    expect(formatDateRange('2026-10-01', '2026-10-10', 'en')).toBe(
      expectedRange('2026-10-01', '2026-10-10', 'en'),
    );
    expect(formatDateRange('2026-10-01', '2026-10-10', 'uk')).toBe(
      expectedRange('2026-10-01', '2026-10-10', 'uk'),
    );
    expect(formatDateRange('2026-10-01', '2026-10-10', 'en')).not.toBe(
      formatDateRange('2026-10-01', '2026-10-10', 'uk'),
    );
  });

  it('names the year when the range crosses one', () => {
    expect(formatDateRange('2026-12-28', '2027-01-04', 'en')).toBe(
      expectedRange('2026-12-28', '2027-01-04', 'en'),
    );
    expect(formatDateRange('2026-12-28', '2027-01-04', 'uk')).toBe(
      expectedRange('2026-12-28', '2027-01-04', 'uk'),
    );
    expect(formatDateRange('2026-12-28', '2027-01-04', 'en')).toContain('2026');
    expect(formatDateRange('2026-12-28', '2027-01-04', 'en')).toContain('2027');
  });
});

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('steps backward onto the previous month', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('startOfMonth', () => {
  it('keeps the year and month and resets the day', () => {
    expect(startOfMonth('2026-10-06')).toBe('2026-10-01');
  });
});

describe('addMonths', () => {
  it('moves to the first day of the target month', () => {
    expect(addMonths('2026-01-15', 1)).toBe('2026-02-01');
  });

  it('rolls into the next year', () => {
    expect(addMonths('2026-12-20', 1)).toBe('2027-01-01');
  });
});

describe('startOfWeek', () => {
  it('starts the week on Monday', () => {
    expect(startOfWeek('2026-10-06')).toBe('2026-10-05');
    expect(startOfWeek('2026-10-04')).toBe('2026-09-28');
  });
});

describe('monthTitle', () => {
  it('uses the english month name', () => {
    expect(monthTitle('2026-10-06', 'en')).toBe('October 2026');
  });

  it('uses a ukrainian month name for uk and uk-UA', () => {
    expect(monthTitle('2026-10-06', 'uk')).toBe(
      monthTitle('2026-10-06', 'uk-UA'),
    );
    expect(monthTitle('2026-10-06', 'uk')).not.toBe('October 2026');
  });
});

describe('weekTitle', () => {
  it('lists the day range when the week stays in one month', () => {
    expect(weekTitle('2026-10-06', 'en')).toBe('5–11 October 2026');
  });

  it('names both months when the week crosses a month', () => {
    expect(weekTitle('2026-10-01', 'en')).toBe('28 September – 4 October 2026');
  });

  it('names both years when the week crosses a year', () => {
    expect(weekTitle('2026-01-01', 'en')).toBe(
      '29 December 2025 – 4 January 2026',
    );
  });
});
