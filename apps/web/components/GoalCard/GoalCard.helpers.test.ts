import { describe, expect, it } from '@jest/globals';

import { chartTicks } from './GoalCard.helpers';

describe('chartTicks', () => {
  it('keeps every tick for small goals when within the maximum', () => {
    expect(chartTicks(1)).toEqual([0, 1]);
    expect(chartTicks(4)).toEqual([0, 1, 2, 3, 4]);
    expect(chartTicks(5)).toEqual([0, 2, 4, 5]);
  });

  it('spaces ticks out for goals with many habits', () => {
    expect(chartTicks(6)).toEqual([0, 2, 4, 6]);
    expect(chartTicks(7)).toEqual([0, 2, 4, 6, 7]);
    expect(chartTicks(9)).toEqual([0, 3, 6, 9]);
    expect(chartTicks(10)).toEqual([0, 3, 6, 9, 10]);
  });

  it('never exceeds the maximum tick count and always labels the maximum', () => {
    for (let max = 1; max <= 10; max += 1) {
      const ticks = chartTicks(max);

      expect(ticks.length).toBeLessThanOrEqual(5);
      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBe(max);
    }
  });
});
