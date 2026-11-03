import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import { AccountSecurityView } from './AccountSecurityView';
import { renderWithProviders } from '../../test/render';

jest.mock('@/components/SecuritySection', () => ({
  SecuritySection: () => <h2>Password</h2>,
}));

describe('AccountSecurityView', () => {
  it('shows the password section', () => {
    renderWithProviders(<AccountSecurityView />);

    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Password']);
  });
});
