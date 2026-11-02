import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AccountView } from './AccountView';
import { renderWithProviders } from '../../test/render';

// jest.mock factories run before this file's code, so they build the
// fakes themselves. Shell and guard pass through; sections are headings.
jest.mock('@/components/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/ProfileSection', () => ({
  ProfileSection: () => <h2>Profile</h2>,
}));
jest.mock('@/components/SecuritySection', () => ({
  SecuritySection: () => <h2>Security</h2>,
}));
jest.mock('@/components/CoachSection', () => ({
  CoachSection: () => <h2>AI Coach</h2>,
}));
jest.mock('@/components/DangerZoneSection', () => ({
  DangerZoneSection: () => <h2>Danger zone</h2>,
}));

describe('AccountView', () => {
  it('shows the sections in the order of the spec', () => {
    renderWithProviders(<AccountView />);

    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Profile', 'Security', 'AI Coach', 'Danger zone']);
  });

  it('names the page in the UI language', () => {
    renderWithProviders(<AccountView />, { locale: 'uk' });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Обліковий запис' }),
    ).toBeInTheDocument();
  });
});
