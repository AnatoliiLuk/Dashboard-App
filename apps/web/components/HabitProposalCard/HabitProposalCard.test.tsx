import { describe, expect, it, jest } from '@jest/globals';
import type { ApiHabitProposal } from '@repo/api-client';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HabitProposalCard } from './HabitProposalCard';
import { renderWithProviders } from '../../test/render';

const proposal: ApiHabitProposal = {
  name: 'Meditate 2 minutes',
  color: 'violet',
  reason: 'A tiny start is easy to keep.',
};

describe('HabitProposalCard', () => {
  it('shows the suggested habit and adds it only when accepted', async () => {
    const user = userEvent.setup();
    const onAccept = jest.fn(async (_proposal: ApiHabitProposal) => undefined);

    renderWithProviders(
      <HabitProposalCard proposal={proposal} onAccept={onAccept} />,
    );

    expect(screen.getByText('Meditate 2 minutes')).toBeInTheDocument();
    expect(
      screen.getByText('A tiny start is easy to keep.'),
    ).toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Add habit' }));

    expect(onAccept).toHaveBeenCalledWith(proposal);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Added to your habits.',
    );
    expect(
      screen.queryByRole('button', { name: 'Add habit' }),
    ).not.toBeInTheDocument();
  });

  it('hides the card when dismissed', async () => {
    const user = userEvent.setup();
    const onAccept = jest.fn(async () => undefined);

    renderWithProviders(
      <HabitProposalCard proposal={proposal} onAccept={onAccept} />,
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(
      screen.queryByRole('region', { name: 'Suggested habit' }),
    ).not.toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('lets the person try again when adding fails', async () => {
    const user = userEvent.setup();
    const onAccept = jest
      .fn<(proposal: ApiHabitProposal) => Promise<void>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);

    renderWithProviders(
      <HabitProposalCard proposal={proposal} onAccept={onAccept} />,
    );

    await user.click(screen.getByRole('button', { name: 'Add habit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't add the habit. Try again.",
    );

    await user.click(screen.getByRole('button', { name: 'Add habit' }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(onAccept).toHaveBeenCalledTimes(2);
  });
});
