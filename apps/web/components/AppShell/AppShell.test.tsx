import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';

import { AppShell } from './AppShell';
import { renderWithProviders } from '../../test/render';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// The account menu and tab bar have their own tests.
jest.mock('@/components/AccountMenu', () => ({
  AccountMenu: () => null,
}));
jest.mock('@/components/MobileNav', () => ({
  MobileNav: () => null,
}));

function renderShell() {
  return renderWithProviders(
    <AppShell>
      <p>Page body</p>
    </AppShell>,
  );
}

describe('AppShell', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('keeps the header outside the main landmark', () => {
    renderShell();

    const banner = screen.getByRole('banner');
    const main = screen.getByRole('main');
    expect(main).not.toContainElement(banner);
    expect(main).toHaveTextContent('Page body');
  });

  it('links the brand home instead of making it the page heading', () => {
    mockPathname = '/goals';
    renderShell();

    expect(screen.getByRole('link', { name: 'Habits+' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'My goals',
    );
  });

  it('lets keyboard users skip to the page content', () => {
    renderShell();

    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('marks the section of a nested route as current', () => {
    mockPathname = '/goals/goal-1';
    renderShell();

    const nav = within(screen.getByRole('navigation', { hidden: true }));
    expect(
      nav.getByRole('link', { name: 'My goals', hidden: true }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      nav.getByRole('link', { name: 'Calendar', hidden: true }),
    ).not.toHaveAttribute('aria-current');
  });
});
