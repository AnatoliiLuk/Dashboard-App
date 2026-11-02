import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { CoachUsage } from '@repo/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CoachSection } from './CoachSection';
import { formatDateTime } from '@/lib/habits/dates';
import { renderWithProviders } from '../../test/render';

const usage: CoachUsage = {
  enabled: true,
  usedTokens: 25000,
  dailyLimit: 100000,
  resetsAt: '2026-10-27T00:00:00.000Z',
};

type UsageQuery =
  | { isPending: true; isError: false; data: undefined }
  | { isPending: false; isError: true; data: undefined }
  | { isPending: false; isError: false; data: CoachUsage };

let mockUsage: UsageQuery;
let mockClear: {
  mutate: jest.Mock;
  reset: jest.Mock;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
};

jest.mock('@/lib/hooks/useCoach', () => ({
  useCoachUsage: () => mockUsage,
  useClearConversation: () => mockClear,
}));

const loaded = (data: CoachUsage): UsageQuery => ({
  isPending: false,
  isError: false,
  data,
});

describe('CoachSection', () => {
  beforeEach(() => {
    mockUsage = loaded(usage);
    mockClear = {
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
    };
  });

  it('shows today’s usage, a progress bar and the local reset time', () => {
    renderWithProviders(<CoachSection />);

    expect(
      screen.getByText(
        `${(25000).toLocaleString('en')} of ${(100000).toLocaleString('en')} tokens used today`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: "Today's AI coach usage" }),
    ).toHaveAttribute('aria-valuenow', '25');
    expect(
      screen.getByText(`Resets ${formatDateTime(usage.resetsAt, 'en')}`),
    ).toBeInTheDocument();
  });

  it('caps the bar at full when usage is over the limit', () => {
    mockUsage = loaded({ ...usage, usedTokens: 120000 });
    renderWithProviders(<CoachSection />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('says the coach is off, hides the bar and still offers clearing', () => {
    mockUsage = loaded({ ...usage, enabled: false });
    renderWithProviders(<CoachSection />);

    expect(
      screen.getByText('The AI coach is turned off right now.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Clear conversation' }),
    ).toBeEnabled();
  });

  it('reports a failed usage load', () => {
    mockUsage = { isPending: false, isError: true, data: undefined };
    renderWithProviders(<CoachSection />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't load your AI coach usage.",
    );
  });

  it('clears the conversation only after confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoachSection />);

    await user.click(
      screen.getByRole('button', { name: 'Clear conversation' }),
    );

    expect(
      screen.getByText('Delete your conversation with the coach for good?'),
    ).toBeInTheDocument();
    expect(mockClear.mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(mockClear.mutate).toHaveBeenCalledTimes(1);
  });

  it('keeps the conversation when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoachSection />);

    await user.click(
      screen.getByRole('button', { name: 'Clear conversation' }),
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockClear.mutate).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Clear conversation' }),
    ).toBeInTheDocument();
  });

  it('confirms a cleared conversation and reports a failure', () => {
    mockClear.isSuccess = true;
    const { unmount } = renderWithProviders(<CoachSection />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Conversation deleted.',
    );
    unmount();

    mockClear.isSuccess = false;
    mockClear.isError = true;
    renderWithProviders(<CoachSection />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't delete the conversation. Try again.",
    );
  });

  it('is translated into Ukrainian', () => {
    renderWithProviders(<CoachSection />, { locale: 'uk' });

    expect(
      screen.getByRole('heading', { name: 'ШІ-коуч' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Очистити розмову' }),
    ).toBeInTheDocument();
  });
});
