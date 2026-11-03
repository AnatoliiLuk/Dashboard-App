import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { OAuthConsentRequest } from '@repo/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OAuthConsent } from './OAuthConsent';
import { renderWithProviders } from '../../test/render';

const consent: OAuthConsentRequest = {
  clientName: 'Claude',
  clientUri: null,
  redirectHost: 'claude.ai',
  scopes: ['habits:read', 'habits:write'],
};

let mockConsent: { data?: OAuthConsentRequest; isError: boolean };
const mockDecide = jest.fn<(dto: object) => Promise<{ redirectTo: string }>>();
let mockDecideState = { isPending: false, isSuccess: false, isError: false };

jest.mock('@/lib/hooks/useOAuthConsent', () => ({
  useOAuthConsent: () => mockConsent,
  useDecideConsent: () => ({ mutateAsync: mockDecide, ...mockDecideState }),
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'ada@example.com' } }),
}));

describe('OAuthConsent', () => {
  beforeEach(() => {
    mockConsent = { data: consent, isError: false };
    mockDecide.mockReset();
    mockDecideState = { isPending: false, isSuccess: false, isError: false };
  });

  it('shows who asks, for what, for which account and where it returns', () => {
    renderWithProviders(<OAuthConsent request="signed" />);

    expect(
      screen.getByRole('heading', {
        name: 'Allow Claude to use your Habits+ account?',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Signed in as ada@example.com.'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual([
      'See your habits, check-ins and goals',
      'Log or undo check-ins and create habits',
    ]);
    expect(
      screen.getByText('After you choose, you go back to claude.ai.'),
    ).toBeInTheDocument();
  });

  it('names an unnamed client honestly', () => {
    mockConsent = { data: { ...consent, clientName: null }, isError: false };
    renderWithProviders(<OAuthConsent request="signed" />);

    expect(
      screen.getByRole('heading', {
        name: 'Allow an unnamed app to use your Habits+ account?',
      }),
    ).toBeInTheDocument();
  });

  it('approves and sends the browser to the client redirect', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    mockDecide.mockResolvedValue({
      redirectTo: 'https://claude.ai/cb?code=abc',
    });
    renderWithProviders(<OAuthConsent request="signed" navigate={navigate} />);

    await user.click(screen.getByRole('button', { name: 'Allow' }));

    expect(mockDecide).toHaveBeenCalledWith({
      request: 'signed',
      approve: true,
    });
    expect(navigate).toHaveBeenCalledWith('https://claude.ai/cb?code=abc');
  });

  it('denies and still returns to the client', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    mockDecide.mockResolvedValue({
      redirectTo: 'https://claude.ai/cb?error=access_denied',
    });
    renderWithProviders(<OAuthConsent request="signed" navigate={navigate} />);

    await user.click(screen.getByRole('button', { name: 'Deny' }));

    expect(mockDecide).toHaveBeenCalledWith({
      request: 'signed',
      approve: false,
    });
    expect(navigate).toHaveBeenCalledWith(
      'https://claude.ai/cb?error=access_denied',
    );
  });

  it('explains an invalid or expired link', () => {
    mockConsent = { isError: true };
    renderWithProviders(<OAuthConsent request="expired" />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This link is invalid or has expired.',
    );
    expect(screen.queryByRole('button', { name: 'Allow' })).toBeNull();
  });

  it('treats a missing request as invalid', () => {
    renderWithProviders(<OAuthConsent request="" />);

    expect(screen.getByRole('alert')).toHaveTextContent('invalid');
  });

  it('keeps both buttons off while leaving', () => {
    mockDecideState = { isPending: false, isSuccess: true, isError: false };
    renderWithProviders(<OAuthConsent request="signed" />);

    expect(screen.getByRole('button', { name: 'Deny' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'One moment…' })).toBeDisabled();
  });
});
