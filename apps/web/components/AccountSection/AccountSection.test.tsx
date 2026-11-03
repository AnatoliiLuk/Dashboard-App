import { describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react';

import { AccountSection } from './AccountSection';
import { renderWithProviders } from '../../test/render';

describe('AccountSection', () => {
  it('names the section by its heading and shows the explanation', () => {
    renderWithProviders(
      <AccountSection title="Profile" description="Your name and email.">
        <button type="button">Save</button>
      </AccountSection>,
    );

    const section = screen.getByRole('region', { name: 'Profile' });
    expect(
      screen.getByRole('heading', { level: 2, name: 'Profile' }),
    ).toBeInTheDocument();
    expect(section).toHaveTextContent('Your name and email.');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows a badge next to the title without renaming the heading', () => {
    renderWithProviders(
      <AccountSection
        title="AI Coach"
        description="Usage."
        badge={<span aria-hidden>AI</span>}
      >
        {null}
      </AccountSection>,
    );

    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'AI Coach' }),
    ).toHaveTextContent(/^AI Coach$/);
  });
});
