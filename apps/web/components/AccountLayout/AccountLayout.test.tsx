import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AccountLayout } from './AccountLayout';
import { renderWithProviders } from '../../test/render';

let mockPathname = '/account';

// Shell and guard pass through, so only the layout itself is under test.
jest.mock('@/components/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const tabs = () =>
  within(screen.getByRole('navigation', { name: 'Account settings' }));

describe('AccountLayout', () => {
  beforeEach(() => {
    mockPathname = '/account';
  });

  it('names the page and links every tab to its own route', () => {
    renderWithProviders(
      <AccountLayout>
        <h2>Profile</h2>
      </AccountLayout>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Account' }),
    ).toBeInTheDocument();
    expect(
      tabs()
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/account', '/account/security', '/account/ai']);
    expect(tabs().getByRole('link', { name: 'AI & apps' })).toHaveTextContent(
      'AI & appsAI',
    );
    expect(tabs().getAllByText('AI')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Profile' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['/account', 'Profile'],
    ['/account/security', 'Security'],
    ['/account/ai', 'AI & apps'],
  ])('marks only the current tab on %s', (pathname, current) => {
    mockPathname = pathname;
    renderWithProviders(<AccountLayout>{null}</AccountLayout>);

    const marked = tabs().getAllByRole('link', { current: 'page' });
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveAccessibleName(current);
  });

  it('is translated into Ukrainian', () => {
    renderWithProviders(<AccountLayout>{null}</AccountLayout>, {
      locale: 'uk',
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Обліковий запис' }),
    ).toBeInTheDocument();
    const links = within(
      screen.getByRole('navigation', {
        name: 'Налаштування облікового запису',
      }),
    ).getAllByRole('link');
    ['Профіль', 'Безпека', 'ШІ та застосунки'].forEach((name, index) => {
      expect(links[index]).toHaveAccessibleName(name);
    });
  });
});
