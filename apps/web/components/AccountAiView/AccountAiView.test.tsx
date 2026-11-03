import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { AccountAiView } from './AccountAiView';
import { renderWithProviders } from '../../test/render';

jest.mock('@/components/CoachSection', () => ({
  CoachSection: () => <h2>AI Coach</h2>,
}));
jest.mock('@/components/ConnectedAppsSection', () => ({
  ConnectedAppsSection: () => <h2>Connected apps</h2>,
}));

describe('AccountAiView', () => {
  it('shows the coach, then the connected apps', () => {
    renderWithProviders(<AccountAiView />);

    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['AI Coach', 'Connected apps']);
  });
});
