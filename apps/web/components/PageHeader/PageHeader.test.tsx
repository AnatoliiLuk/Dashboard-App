import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PageHeader } from './PageHeader';
import { renderWithProviders } from '../../test/render';

describe('PageHeader', () => {
  it('names the page with its only top-level heading', () => {
    renderWithProviders(<PageHeader title="Calendar" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Calendar' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('runs the page action', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    renderWithProviders(
      <PageHeader
        title="Log habits"
        actionLabel="Add habit"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add habit' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('can disable the action while the page is busy', () => {
    renderWithProviders(
      <PageHeader
        title="AI Coach"
        actionLabel="New chat"
        actionDisabled
        onAction={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'New chat' })).toBeDisabled();
  });
});
