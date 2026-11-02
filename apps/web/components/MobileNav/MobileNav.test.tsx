import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { MobileNav } from './MobileNav';
import { renderWithProviders } from '../../test/render';

const mockPathname = '/log';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('MobileNav', () => {
  it('shows a short label for every section', () => {
    renderWithProviders(<MobileNav />, { locale: 'uk' });

    expect(
      screen
        .getAllByRole('link', { hidden: true })
        .map((link) => link.textContent),
    ).toEqual(['Календар', 'Журнал', 'Цілі', 'Коуч']);
  });

  it('marks the current section', () => {
    renderWithProviders(<MobileNav />);

    expect(
      screen.getByRole('link', { name: 'Log', hidden: true }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
