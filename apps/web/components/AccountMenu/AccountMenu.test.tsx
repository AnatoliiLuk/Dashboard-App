import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountMenu } from './AccountMenu';
import { renderWithProviders } from '../../test/render';

const mockReplace = jest.fn();
const mockLogout = jest.fn();
let mockPathname = '/';
let mockAuth = { isAuthReady: true, isAuthenticated: true };

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    ...mockAuth,
    user: mockAuth.isAuthenticated
      ? { id: 'user-a', email: 'ada@example.com', name: 'Ada' }
      : null,
    logout: mockLogout,
  }),
}));

const trigger = () => screen.getByRole('button', { name: 'Account menu' });

describe('AccountMenu', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockLogout.mockReset();
    mockPathname = '/';
    mockAuth = { isAuthReady: true, isAuthenticated: true };
  });

  it('shows the initial and keeps the panel closed', () => {
    renderWithProviders(<AccountMenu />);

    expect(trigger()).toHaveTextContent('A');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('holds the account link, preferences and sign-out', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountMenu />);

    await user.click(trigger());

    const dialog = screen.getByRole('dialog', { name: 'Account menu' });
    expect(dialog).toHaveTextContent('ada@example.com');
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'href',
      '/account',
    );
    expect(
      screen.getByRole('group', { name: 'Color theme' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
  });

  it('marks the account link on the account page', async () => {
    mockPathname = '/account';
    const user = userEvent.setup();
    renderWithProviders(<AccountMenu />);

    await user.click(trigger());

    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('signs out and goes to the sign-in page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountMenu />);

    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountMenu />);

    await user.click(trigger());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('offers sign-in to a signed-out visitor', () => {
    mockAuth = { isAuthReady: true, isAuthenticated: false };
    renderWithProviders(<AccountMenu />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('renders no control while the session is unknown', () => {
    mockAuth = { isAuthReady: false, isAuthenticated: false };
    renderWithProviders(<AccountMenu />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
