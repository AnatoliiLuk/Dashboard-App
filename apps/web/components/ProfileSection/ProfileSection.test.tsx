import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError } from '@repo/api-client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProfileSection } from './ProfileSection';
import { renderWithProviders } from '../../test/render';

const mockUpdate = jest.fn<(dto: object) => Promise<unknown>>();
let mockPending = false;

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-a',
      email: 'ada@example.com',
      name: 'Ada',
      createdAt: '2026-10-01T09:00:00.000Z',
    },
  }),
}));

jest.mock('@/lib/hooks/useAccount', () => ({
  useUpdateProfile: () => ({
    mutateAsync: mockUpdate,
    isPending: mockPending,
  }),
}));

const nameField = () => screen.getByRole('textbox', { name: 'Name' });
const emailField = () => screen.getByRole('textbox', { name: 'Email' });
const passwordField = () => screen.queryByLabelText(/Current password/);
const save = () => screen.getByRole('button', { name: 'Save' });

describe('ProfileSection', () => {
  beforeEach(() => {
    mockUpdate.mockReset();
    mockUpdate.mockResolvedValue({});
    mockPending = false;
  });

  it('shows the name, email and join date', () => {
    renderWithProviders(<ProfileSection />);

    expect(nameField()).toHaveValue('Ada');
    expect(emailField()).toHaveValue('ada@example.com');
    expect(screen.getByText(/Member since/)).toHaveTextContent('2026');
  });

  it('changes the name without asking for the password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />);

    await user.clear(nameField());
    await user.type(nameField(), 'Ada Lovelace');
    expect(passwordField()).not.toBeInTheDocument();
    await user.click(save());

    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Ada Lovelace' });
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
  });

  it('asks for the current password once the email changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />);

    await user.clear(emailField());
    await user.type(emailField(), 'countess@example.com');
    await user.click(save());

    expect(passwordField()).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Enter your current password to change the email.',
      ),
    ).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('sends only the email and password when only the email changed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />);

    await user.clear(emailField());
    await user.type(emailField(), 'Countess@Example.com');
    await user.type(passwordField()!, 'long-enough');
    await user.click(save());

    expect(mockUpdate).toHaveBeenCalledWith({
      email: 'countess@example.com',
      currentPassword: 'long-enough',
    });
  });

  it('shows a taken email on the email field', async () => {
    mockUpdate.mockRejectedValue(new ApiError(409, 'Email already in use'));
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />);

    await user.clear(emailField());
    await user.type(emailField(), 'grace@example.com');
    await user.type(passwordField()!, 'long-enough');
    await user.click(save());

    expect(
      await screen.findByText('This email is already used by another account.'),
    ).toBeInTheDocument();
    expect(emailField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a wrong password on the password field', async () => {
    mockUpdate.mockRejectedValue(
      new ApiError(400, 'Current password is incorrect'),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />);

    await user.clear(emailField());
    await user.type(emailField(), 'countess@example.com');
    await user.type(passwordField()!, 'wrong-password');
    await user.click(save());

    expect(
      await screen.findByText('The current password is incorrect.'),
    ).toBeInTheDocument();
    expect(passwordField()).toHaveAttribute('aria-invalid', 'true');
  });

  it('explains a rate limit in the UI language', async () => {
    mockUpdate.mockRejectedValue(
      new ApiError(429, 'Too many attempts. Wait a minute and try again'),
    );
    const user = userEvent.setup();
    renderWithProviders(<ProfileSection />, { locale: 'uk' });

    await user.clear(screen.getByRole('textbox', { name: "Ім'я" }));
    await user.type(screen.getByRole('textbox', { name: "Ім'я" }), 'Ада');
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(
      await screen.findByText(
        'Забагато спроб. Зачекайте хвилину й спробуйте ще.',
      ),
    ).toBeInTheDocument();
  });

  it('shows Ukrainian copy', () => {
    renderWithProviders(<ProfileSection />, { locale: 'uk' });

    expect(
      screen.getByRole('heading', { name: 'Профіль' }),
    ).toBeInTheDocument();
  });
});
