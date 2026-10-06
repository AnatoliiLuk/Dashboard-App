import { afterEach, describe, expect, it, jest } from '@jest/globals';

import {
  addDays,
  addMonths,
  compareDates,
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
  it('renders the day before the month', () => {
    expect(formatDisplay('2026-10-06')).toBe('06-10-2026');
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
