import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError } from '@repo/api-client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from './LoginForm';
import { renderWithProviders } from '../../test/render';

const mockReplace = jest.fn();
const mockLogin = jest.fn();
let mockNextPath: string | null = null;
let mockPending = false;

jest.mock('next/link', () => {
  const React = require('react');
  return function Link({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return React.createElement('a', { href }, children);
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'next' ? mockNextPath : null),
  }),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginMutation: { isPending: mockPending },
  }),
}));

async function signIn(
  user: ReturnType<typeof userEvent.setup>,
  email = 'ada@example.com',
) {
  await user.type(screen.getByRole('textbox', { name: 'Email' }), email);
  await user.type(
    screen.getByLabelText('Password', { exact: false }),
    'long-enough',
  );
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockLogin.mockReset();
    mockLogin.mockResolvedValue(undefined);
    mockNextPath = null;
    mockPending = false;
  });

  it('signs in and opens the home page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await signIn(user);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'long-enough',
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('trims the email and follows a safe next path', async () => {
    const user = userEvent.setup();
    mockNextPath = '/log';
    renderWithProviders(<LoginForm />);

    await signIn(user, '  ada@example.com  ');

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'long-enough',
    });
    expect(mockReplace).toHaveBeenCalledWith('/log');
    expect(
      screen.getByRole('link', { name: 'Create account' }),
    ).toHaveAttribute('href', '/register?next=%2Flog');
  });

  it('ignores an off-site next path', async () => {
    const user = userEvent.setup();
    mockNextPath = '//evil.example';
    renderWithProviders(<LoginForm />);

    await signIn(user);

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows an API error message', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new ApiError(401, 'Invalid credentials'));
    renderWithProviders(<LoginForm />);

    await signIn(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows a generic error when login fails for another reason', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('network'));
    renderWithProviders(<LoginForm />);

    await signIn(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong.',
    );
  });

  it('disables the submit button while the request is pending', () => {
    mockPending = true;
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  });
});
