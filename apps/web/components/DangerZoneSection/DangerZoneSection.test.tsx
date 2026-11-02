import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError } from '@repo/api-client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DangerZoneSection } from './DangerZoneSection';
import { renderWithProviders } from '../../test/render';

// A reworded message proves the dialog maps on the code, not on the text.
function apiError(status: number, code?: string) {
  const message = 'Reworded server text.';
  return new ApiError(status, message, { status: 'error', message, code });
}

const mockDelete = jest.fn<(dto: object) => Promise<unknown>>();
const mockReplace = jest.fn();

jest.mock('@/lib/hooks/useAccount', () => ({
  useDeleteAccount: () => ({ mutateAsync: mockDelete, isPending: false }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

async function openAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  password = 'long-enough',
) {
  await user.click(screen.getByRole('button', { name: 'Delete account' }));
  if (password) {
    await user.type(screen.getByLabelText(/^Password/), password);
  }
  await user.click(screen.getByRole('button', { name: 'Delete forever' }));
}

describe('DangerZoneSection', () => {
  beforeEach(() => {
    mockDelete.mockReset();
    mockDelete.mockResolvedValue(undefined);
    mockReplace.mockReset();
  });

  it('explains what is deleted before asking for the password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete your account?' });
    expect(dialog).toHaveAccessibleDescription(
      /deleted for good.*This cannot be undone\./,
    );
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deletes with the password and goes to sign in', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await openAndSubmit(user);

    expect(mockDelete).toHaveBeenCalledWith({ password: 'long-enough' });
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('asks for the password without calling the API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await openAndSubmit(user, '');

    expect(screen.getByLabelText(/^Password/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('shows a wrong password on the field and keeps the dialog open', async () => {
    mockDelete.mockRejectedValue(apiError(400, 'CURRENT_PASSWORD_INCORRECT'));
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await openAndSubmit(user);

    expect(
      await screen.findByText('The password is incorrect.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('explains a rate limit', async () => {
    mockDelete.mockRejectedValue(apiError(429, 'RATE_LIMITED'));
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await openAndSubmit(user);

    expect(
      await screen.findByText(
        'Too many attempts. Wait a minute and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('never shows a raw server message', async () => {
    mockDelete.mockRejectedValue(apiError(500));
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await openAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong.',
    );
  });

  it('closes on cancel without deleting', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />);

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('is translated into Ukrainian', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DangerZoneSection />, { locale: 'uk' });

    await user.click(
      screen.getByRole('button', { name: 'Видалити обліковий запис' }),
    );

    expect(
      screen.getByRole('dialog', { name: 'Видалити обліковий запис?' }),
    ).toBeInTheDocument();
  });
});
