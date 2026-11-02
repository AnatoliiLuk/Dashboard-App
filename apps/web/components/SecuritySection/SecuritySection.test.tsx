import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError } from '@repo/api-client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SecuritySection } from './SecuritySection';
import { renderWithProviders } from '../../test/render';

const mockChange = jest.fn<(dto: object) => Promise<unknown>>();

jest.mock('@/lib/hooks/useAccount', () => ({
  useChangePassword: () => ({
    mutateAsync: mockChange,
    isPending: false,
  }),
}));

const current = () => screen.getByLabelText(/^Current password/);
const next = () => screen.getByLabelText(/^New password/);
const confirm = () => screen.getByLabelText(/^Confirm new password/);
const submit = () => screen.getByRole('button', { name: 'Change password' });

async function fill(
  user: ReturnType<typeof userEvent.setup>,
  values = {
    current: 'long-enough',
    next: 'brand-new-secret',
    confirm: 'brand-new-secret',
  },
) {
  await user.type(current(), values.current);
  await user.type(next(), values.next);
  await user.type(confirm(), values.confirm);
  await user.click(submit());
}

describe('SecuritySection', () => {
  beforeEach(() => {
    mockChange.mockReset();
    mockChange.mockResolvedValue({ token: 'new-token' });
  });

  it('changes the password and says other devices were signed out', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />);

    await fill(user);

    expect(mockChange).toHaveBeenCalledWith({
      currentPassword: 'long-enough',
      newPassword: 'brand-new-secret',
    });
    expect(
      await screen.findByText(
        'Password changed. Your other devices were signed out.',
      ),
    ).toBeInTheDocument();
    expect(current()).toHaveValue('');
  });

  it('hides the success message once the user types again', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />);

    await fill(user);
    await screen.findByRole('status');
    await user.type(current(), 'x');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('rejects a confirmation that does not match without calling the API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />);

    await fill(user, {
      current: 'long-enough',
      next: 'brand-new-secret',
      confirm: 'another-secret',
    });

    expect(
      await screen.findByText('The passwords do not match.'),
    ).toBeInTheDocument();
    expect(mockChange).not.toHaveBeenCalled();
  });

  it('rejects a new password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />);

    await fill(user, {
      current: 'long-enough',
      next: 'short',
      confirm: 'short',
    });

    expect(
      await screen.findByText('At least 8 characters.', {
        selector: '.Mui-error',
      }),
    ).toBeInTheDocument();
    expect(mockChange).not.toHaveBeenCalled();
  });

  it('shows a wrong current password on that field', async () => {
    mockChange.mockRejectedValue(
      new ApiError(400, 'Current password is incorrect'),
    );
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />);

    await fill(user);

    expect(
      await screen.findByText('The current password is incorrect.'),
    ).toBeInTheDocument();
    expect(current()).toHaveAttribute('aria-invalid', 'true');
  });

  it('never shows a raw server message, even in Ukrainian', async () => {
    mockChange.mockRejectedValue(new ApiError(500, 'Internal server error'));
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />, { locale: 'uk' });

    await user.type(screen.getByLabelText(/^Поточний пароль/), 'long-enough');
    await user.type(screen.getByLabelText(/^Новий пароль/), 'brand-new-secret');
    await user.type(
      screen.getByLabelText(/^Повторіть новий пароль/),
      'brand-new-secret',
    );
    await user.click(screen.getByRole('button', { name: 'Змінити пароль' }));

    expect(await screen.findByRole('alert')).not.toHaveTextContent(
      'Internal server error',
    );
  });

  it('explains a rate limit', async () => {
    mockChange.mockRejectedValue(new ApiError(429, 'Too many attempts'));
    const user = userEvent.setup();
    renderWithProviders(<SecuritySection />);

    await fill(user);

    expect(
      await screen.findByText(
        'Too many attempts. Wait a minute and try again.',
      ),
    ).toBeInTheDocument();
  });
});
