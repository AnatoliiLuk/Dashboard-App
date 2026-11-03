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

    const links = screen.getAllByRole('link', { hidden: true });
    expect(links).toHaveLength(4);
    ['Календар', 'Журнал', 'Цілі', 'Коуч'].forEach((name, index) => {
      expect(links[index]).toHaveAccessibleName(name);
    });
  });

  it('marks only the coach as AI', () => {
    renderWithProviders(<MobileNav />);

    expect(screen.getAllByText('AI')).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: 'Coach', hidden: true }),
    ).toHaveTextContent('AI');
  });

  it('marks the current section', () => {
    renderWithProviders(<MobileNav />);

    expect(
      screen.getByRole('link', { name: 'Log', hidden: true }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
