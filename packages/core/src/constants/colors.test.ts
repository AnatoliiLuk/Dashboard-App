import { describe, expect, it } from '@jest/globals';
import type { GoalColor, HabitColor } from '@repo/types';

import { goalColor, habitColor } from './colors';

describe('habitColor', () => {
  it('returns the palette entry for a known color', () => {
    expect(habitColor('teal')).toMatchObject({
      id: 'teal',
      background: '#ccfbf1',
      text: '#134e4a',
    });
  });

  it('falls back to sky for an unknown id', () => {
    expect(habitColor('nope' as HabitColor).id).toBe('sky');
  });
});

describe('goalColor', () => {
  it('returns the palette entry for a known color', () => {
    expect(goalColor('crimson')).toMatchObject({
      id: 'crimson',
      background: '#fee2e2',
      text: '#7f1d1d',
      bar: '#b91c1c',
    });
  });

  it('falls back to indigo for an unknown id', () => {
    expect(goalColor('nope' as GoalColor).id).toBe('indigo');
  });
});
