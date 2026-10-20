import { describe, expect, it } from '@jest/globals';

import { archivedAtFor } from './archive.util';

describe('archivedAtFor', () => {
  const now = new Date('2026-10-20T12:00:00.000Z');

  it('leaves the archive state alone when the field is missing', () => {
    expect(archivedAtFor(undefined, () => now)).toBeUndefined();
  });

  it('stamps the time when archiving and clears it when restoring', () => {
    expect(archivedAtFor(true, () => now)).toEqual(now);
    expect(archivedAtFor(false, () => now)).toBeNull();
  });
});
