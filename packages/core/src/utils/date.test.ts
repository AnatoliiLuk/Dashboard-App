import { describe, expect, it } from '@jest/globals';

import { compareDates } from './date';

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
