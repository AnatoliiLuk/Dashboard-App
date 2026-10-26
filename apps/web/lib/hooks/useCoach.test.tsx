import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError, type ApiCoachReply } from '@repo/api-client';
import type { CoachChatDto } from '@repo/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { createI18n } from '@/lib/i18n/createI18n';
import type { Locale } from '@/lib/i18n/locale';

const chat = jest.fn<(dto: CoachChatDto) => Promise<ApiCoachReply>>();

jest.mock('@/lib/api/client', () => ({
  api: { coach: { chat: (dto: CoachChatDto) => chat(dto) } },
}));

// Imported after the mock so the hook uses the fake client.
import { useCoach } from './useCoach';

function reply(text: string): ApiCoachReply {
  return { reply: text, truncated: false, proposal: null };
}

function renderCoach(locale: Locale = 'en') {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const i18n = createI18n(locale, (instance) => {
    instance.use(initReactI18next);
  });

  return renderHook(() => useCoach(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </QueryClientProvider>
    ),
  });
}

beforeEach(() => {
  chat.mockReset();
});

describe('useCoach', () => {
  it('sends the history, locale and local date, then adds the reply', async () => {
    chat.mockResolvedValueOnce(reply('Seven days.'));
    const { result } = renderCoach('uk');

    act(() => result.current.send('  Яка моя серія?  '));

    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(chat).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'Яка моя серія?' }],
      locale: 'uk',
      today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(result.current.entries[1]).toEqual(
      expect.objectContaining({ role: 'assistant', content: 'Seven days.' }),
    );
    expect(result.current.error).toBeNull();
  });

  it('sends earlier turns with the next question', async () => {
    chat
      .mockResolvedValueOnce(reply('First answer.'))
      .mockResolvedValueOnce(reply('Second answer.'));
    const { result } = renderCoach();

    act(() => result.current.send('First'));
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    act(() => result.current.send('Second'));
    await waitFor(() => expect(result.current.entries).toHaveLength(4));

    expect(chat.mock.calls[1][0].messages).toEqual([
      { role: 'user', content: 'First' },
      { role: 'assistant', content: 'First answer.' },
      { role: 'user', content: 'Second' },
    ]);
  });

  it('keeps a failed question and sends it again on retry', async () => {
    chat
      .mockRejectedValueOnce(new ApiError(502, 'unavailable'))
      .mockResolvedValueOnce(reply('Here you go.'));
    const { result } = renderCoach();

    act(() => result.current.send('Help me plan'));
    await waitFor(() => expect(result.current.error).toBe('failed'));
    expect(result.current.entries).toHaveLength(1);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(result.current.error).toBeNull();
    expect(chat.mock.calls[1][0].messages).toEqual([
      { role: 'user', content: 'Help me plan' },
    ]);
  });

  it('tells rate limits and a disabled coach apart', async () => {
    chat.mockRejectedValueOnce(new ApiError(429, 'Too many messages'));
    const limited = renderCoach();
    act(() => limited.result.current.send('Hi'));
    await waitFor(() =>
      expect(limited.result.current.error).toBe('rateLimited'),
    );

    chat.mockRejectedValueOnce(new ApiError(503, 'turned off'));
    const disabled = renderCoach();
    act(() => disabled.result.current.send('Hi'));
    await waitFor(() => expect(disabled.result.current.error).toBe('disabled'));
  });

  it('sends at most 20 messages, starting with a user turn', async () => {
    chat.mockImplementation(async () => reply('ok'));
    const { result } = renderCoach();

    for (let turn = 1; turn <= 11; turn++) {
      act(() => result.current.send(`Question ${turn}`));
      await waitFor(() =>
        expect(result.current.entries).toHaveLength(turn * 2),
      );
    }

    // Turn 11 has 21 entries. The last 20 start with a reply, which is
    // dropped too, so the history starts with the person's second question.
    const messages = chat.mock.calls[10][0].messages;
    expect(messages).toHaveLength(19);
    expect(messages[0]).toEqual({ role: 'user', content: 'Question 2' });
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'Question 11' });
  });
});
