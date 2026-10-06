import { describe, expect, it } from '@jest/globals';
import type { HabitColor } from '@repo/types';

import { habitColor } from './colors';

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
