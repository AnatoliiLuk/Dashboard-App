import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { CoachEntry } from '@/lib/hooks/useCoach';

import { CoachChat } from './CoachChat';
import type { CoachChatProps } from './CoachChat.interface';
import { renderWithProviders } from '../../test/render';

const conversation: CoachEntry[] = [
  { id: 1, role: 'user', content: 'How is my reading going?' },
  {
    id: 2,
    role: 'assistant',
    content: 'Seven days in a row.',
    truncated: false,
    proposal: null,
  },
];

function renderChat(
  props: Partial<CoachChatProps> = {},
  locale: 'en' | 'uk' = 'en',
) {
  const handlers = {
    onSend: jest.fn(),
    onRetry: jest.fn(),
    onAcceptProposal: jest.fn(async () => undefined),
  };
  renderWithProviders(
    <CoachChat
      entries={[]}
      isSending={false}
      error={null}
      {...handlers}
      {...props}
    />,
    { locale },
  );
  return handlers;
}

describe('CoachChat', () => {
  it('starts with example questions and the AI notice', async () => {
    const user = userEvent.setup();
    const { onSend } = renderChat();

    expect(
      screen.getByText(/Answers are written by AI and can be wrong/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('log')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'How are my goals going?' }),
    );

    expect(onSend).toHaveBeenCalledWith('How are my goals going?');
  });

  it('sends a typed message with Enter and clears the field', async () => {
    const user = userEvent.setup();
    const { onSend } = renderChat();
    const input = screen.getByRole('textbox', { name: 'Message the coach' });

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

    await user.type(input, 'Any tip for sleep?{Enter}');

    expect(onSend).toHaveBeenCalledWith('Any tip for sleep?');
    expect(input).toHaveValue('');
  });

  it('keeps Shift+Enter as a new line', async () => {
    const user = userEvent.setup();
    const { onSend } = renderChat();
    const input = screen.getByRole('textbox', { name: 'Message the coach' });

    await user.type(input, 'Line one{Shift>}{Enter}{/Shift}Line two');

    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('Line one\nLine two');
  });

  it('shows the conversation and a thinking line while sending', () => {
    renderChat({ entries: conversation, isSending: true });

    const log = screen.getByRole('log', {
      name: 'Conversation with the coach',
    });
    expect(log).toHaveTextContent('How is my reading going?');
    expect(log).toHaveTextContent('Seven days in a row.');
    expect(log).toHaveTextContent('The coach is thinking…');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('offers a retry when the coach fails', async () => {
    const user = userEvent.setup();
    const { onRetry } = renderChat({
      entries: conversation.slice(0, 1),
      error: 'failed',
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      "The coach couldn't answer. Try again.",
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('explains the rate limit', () => {
    renderChat({ entries: conversation.slice(0, 1), error: 'rateLimited' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      "You've sent a lot of messages.",
    );
  });

  it('turns the composer off when the coach is disabled', () => {
    renderChat({ entries: conversation.slice(0, 1), error: 'disabled' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The AI coach is turned off right now.',
    );
    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Message the coach' }),
    ).toBeDisabled();
  });

  it('speaks Ukrainian', () => {
    renderChat({}, 'uk');

    expect(
      screen.getByRole('textbox', { name: 'Повідомлення для коуча' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Як просуваються мої цілі?' }),
    ).toBeInTheDocument();
  });
});
