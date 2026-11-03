import { describe, expect, it } from '@jest/globals';

import { chartTicks } from './GoalCard.helpers';

describe('chartTicks', () => {
  it('ticks every habit for small goals', () => {
    expect(chartTicks(1)).toEqual([0, 1]);
    expect(chartTicks(4)).toEqual([0, 1, 2, 3, 4]);
  });

  it('spaces ticks out for goals with many habits', () => {
    expect(chartTicks(7)).toEqual([0, 2, 4, 6]);
    expect(chartTicks(10)).toEqual([0, 2, 4, 6, 8, 10]);
  });
});
