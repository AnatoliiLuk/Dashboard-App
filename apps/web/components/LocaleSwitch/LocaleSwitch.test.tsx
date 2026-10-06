import { describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LOCALE_COOKIE } from '@/lib/i18n';

import { LocaleSwitch } from './LocaleSwitch';
import { renderWithProviders } from '../../test/render';

describe('LocaleSwitch', () => {
  it('starts on english', () => {
    renderWithProviders(<LocaleSwitch />);

    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'УК' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('stores ukrainian and marks that button pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocaleSwitch />);

    await user.click(screen.getByRole('button', { name: 'УК' }));

    expect(document.documentElement.lang).toBe('uk');
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=uk`);
    expect(screen.getByRole('button', { name: 'УК' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
