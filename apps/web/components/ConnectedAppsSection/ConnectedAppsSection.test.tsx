import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { OAuthGrant } from '@repo/types';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConnectedAppsSection } from './ConnectedAppsSection';
import { mcpUrl } from '@/lib/api/client';
import { formatDateTime } from '@/lib/habits/dates';
import { renderWithProviders } from '../../test/render';

const claude: OAuthGrant = {
  clientId: 'client-1',
  clientName: 'Claude Code',
  clientUri: null,
  scopes: ['habits:read', 'habits:write'],
  lastUsedAt: '2026-11-03T09:30:00.000Z',
};

type AppsQuery =
  | { isPending: true; isError: false; data: undefined }
  | { isPending: false; isError: true; data: undefined }
  | { isPending: false; isError: false; data: OAuthGrant[] };

let mockApps: AppsQuery;
let mockDisconnect: {
  mutate: jest.Mock;
  reset: jest.Mock;
  isPending: boolean;
  isError: boolean;
  variables: string | undefined;
};

jest.mock('@/lib/hooks/useConnectedApps', () => ({
  useConnectedApps: () => mockApps,
  useDisconnectApp: () => mockDisconnect,
}));

const loaded = (data: OAuthGrant[]): AppsQuery => ({
  isPending: false,
  isError: false,
  data,
});

describe('ConnectedAppsSection', () => {
  beforeEach(() => {
    mockApps = loaded([claude]);
    mockDisconnect = {
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: false,
      isError: false,
      variables: undefined,
    };
  });

  it('lists each app with what it can do and when it was last used', () => {
    renderWithProviders(<ConnectedAppsSection />);

    const row = screen.getByRole('listitem');
    expect(row).toHaveTextContent('Claude Code');
    expect(row).toHaveTextContent(
      'View habits and goals · Log check-ins and create habits',
    );
    expect(row).toHaveTextContent(
      `Last used ${formatDateTime(claude.lastUsedAt, 'en')}`,
    );
  });

  it('names an app that registered without a name', () => {
    mockApps = loaded([{ ...claude, clientName: null }]);
    renderWithProviders(<ConnectedAppsSection />);

    expect(screen.getByRole('listitem')).toHaveTextContent('Unnamed app');
  });

  it('disconnects only after confirming', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectedAppsSection />);
    const row = screen.getByRole('listitem');

    await user.click(within(row).getByRole('button', { name: 'Disconnect' }));
    expect(mockDisconnect.mutate).not.toHaveBeenCalled();
    expect(row).toHaveTextContent('Disconnect Claude Code?');

    await user.click(within(row).getByRole('button', { name: 'Disconnect' }));
    expect(mockDisconnect.mutate).toHaveBeenCalledWith('client-1');
  });

  it('keeps the app when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectedAppsSection />);

    await user.click(screen.getByRole('button', { name: 'Disconnect' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockDisconnect.mutate).not.toHaveBeenCalled();
    expect(
      screen.queryByText('Disconnect Claude Code?'),
    ).not.toBeInTheDocument();
  });

  it('says when a disconnect failed', () => {
    mockDisconnect.isError = true;
    renderWithProviders(<ConnectedAppsSection />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't disconnect the app. Try again.",
    );
  });

  it('says when no app is connected', () => {
    mockApps = loaded([]);
    renderWithProviders(<ConnectedAppsSection />);

    expect(screen.getByText('No apps connected yet.')).toBeInTheDocument();
  });

  it('says when the list could not load', () => {
    mockApps = { isPending: false, isError: true, data: undefined };
    renderWithProviders(<ConnectedAppsSection />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't load your connected apps.",
    );
  });

  it('shows the Claude Code command and copies it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ConnectedAppsSection />);
    const command = `claude mcp add --transport http habits-plus ${mcpUrl}`;

    expect(
      screen.getByLabelText('Command that adds Habits+ to Claude Code'),
    ).toHaveTextContent(command);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await navigator.clipboard.readText()).toBe(command);
    expect(screen.getByRole('status')).toHaveTextContent('Copied.');
  });

  it('is translated into Ukrainian', () => {
    renderWithProviders(<ConnectedAppsSection />, { locale: 'uk' });

    expect(
      screen.getByRole('heading', { level: 2, name: 'Підключені застосунки' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Відключити' }),
    ).toBeInTheDocument();
  });
});
