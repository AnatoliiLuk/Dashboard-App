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
    expect(formatDisplay('2026-10-15', 'en')).toBe('15 Oct 2026');
    expect(formatDisplay('2026-10-15', 'uk')).toBe('15 жовт. 2026 р.');
  });

  it('uses english when the locale is missing', () => {
    expect(formatDisplay('2026-10-15')).toBe('15 Oct 2026');
  });
});

describe('formatDateRange', () => {
  it('collapses a single day into one date', () => {
    expect(formatDateRange('2026-10-15', '2026-10-15', 'en')).toBe(
      '15 Oct 2026',
    );
    expect(formatDateRange('2026-10-15', '2026-10-15', 'uk')).toBe(
      '15 жовт. 2026 р.',
    );
  });

  it('keeps both ends when the stretch is longer', () => {
    expect(formatDateRange('2026-10-01', '2026-10-10', 'en')).toBe(
      '1\u2009–\u200910 Oct 2026',
    );
    expect(formatDateRange('2026-10-01', '2026-10-10', 'uk')).toBe(
      '1–10 жовт. 2026 р.',
    );
  });

  it('names the year when the range crosses one', () => {
    expect(formatDateRange('2026-12-28', '2027-01-04', 'en')).toBe(
      '28 Dec 2026\u2009–\u20094 Jan 2027',
    );
    expect(formatDateRange('2026-12-28', '2027-01-04', 'uk')).toBe(
      '28 груд. 2026 – 4 січ. 2027 рр.',
    );
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
