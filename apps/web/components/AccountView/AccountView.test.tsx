import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { AccountView } from './AccountView';
import { renderWithProviders } from '../../test/render';

// jest.mock factories run before this file's code, so they build the
// fakes themselves. Sections are headings.
jest.mock('@/components/ProfileSection', () => ({
  ProfileSection: () => <h2>Profile</h2>,
}));
jest.mock('@/components/DangerZoneSection', () => ({
  DangerZoneSection: () => <h2>Danger zone</h2>,
}));

describe('AccountView', () => {
  it('shows the profile, with the danger zone last', () => {
    renderWithProviders(<AccountView />);

    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Profile', 'Danger zone']);
  });
});
