import { describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react';

import { AiBadge } from './AiBadge';
import { renderWithProviders } from '../../test/render';

describe('AiBadge', () => {
  it('shows AI without adding to the accessible name', () => {
    renderWithProviders(
      <button type="button">
        Coach <AiBadge />
      </button>,
    );

    expect(screen.getByText('AI')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('Coach');
  });

  it('is translated into Ukrainian', () => {
    renderWithProviders(<AiBadge />, { locale: 'uk' });

    expect(screen.getByText('ШІ')).toBeInTheDocument();
  });
});
