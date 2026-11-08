import { describe, expect, it } from '@jest/globals';

import { chartTicks } from './GoalCard.helpers';

describe('chartTicks', () => {
  it('ticks every habit for small goals', () => {
    expect(chartTicks(1)).toEqual([0, 1]);
    expect(chartTicks(4)).toEqual([0, 1, 2, 3, 4]);
    expect(chartTicks(5)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('spaces ticks out for goals with many habits', () => {
    expect(chartTicks(6)).toEqual([0, 2, 4, 6]);
    expect(chartTicks(10)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('labels the axis maximum when it is not a multiple of the step', () => {
    expect(chartTicks(7)).toEqual([0, 2, 4, 6, 7]);
    expect(chartTicks(9)).toEqual([0, 2, 4, 6, 8, 9]);
  });

  it('always ends on the maximum, so a fully logged day has a label', () => {
    for (let max = 1; max <= 10; max += 1) {
      const ticks = chartTicks(max);

      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBe(max);
    }
  });
});
