import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  ApiError,
  type ApiCoachConversation,
  type ApiCoachReply,
} from '@repo/api-client';
import type { CoachChatDto } from '@repo/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { createI18n } from '@/lib/i18n/createI18n';
import type { Locale } from '@/lib/i18n/locale';

const chat = jest.fn<(dto: CoachChatDto) => Promise<ApiCoachReply>>();
const getConversation = jest.fn<() => Promise<ApiCoachConversation>>();
const deleteConversation = jest.fn<() => Promise<void>>();

jest.mock('@/lib/api/client', () => ({
  api: {
    coach: {
      chat: (dto: CoachChatDto) => chat(dto),
      getConversation: () => getConversation(),
      deleteConversation: () => deleteConversation(),
    },
  },
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

// Imported after the mocks so the hook uses the fakes.
import { useCoach } from './useCoach';

function reply(text: string): ApiCoachReply {
  return { reply: text, truncated: false, proposal: null };
}

function conversation(
  messages: ApiCoachConversation['messages'] = [],
): ApiCoachConversation {
  return { messages, retentionDays: 30 };
}

function renderCoach(locale: Locale = 'en') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
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

async function renderLoaded(locale: Locale = 'en') {
  const rendered = renderCoach(locale);
  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
}

beforeEach(() => {
  chat.mockReset();
  getConversation.mockReset();
  deleteConversation.mockReset();
  getConversation.mockResolvedValue(conversation());
});

describe('useCoach', () => {
  it('loads the saved conversation', async () => {
    getConversation.mockResolvedValue(
      conversation([
        {
          id: 'm1',
          role: 'user',
          content: 'How is my reading?',
          truncated: false,
          proposal: null,
        },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Seven days.',
          truncated: true,
          proposal: null,
        },
      ]),
    );

    const { result } = await renderLoaded();

    expect(result.current.entries).toEqual([
      { id: 'm1', role: 'user', content: 'How is my reading?' },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Seven days.',
        truncated: true,
        proposal: null,
      },
    ]);
    expect(result.current.retentionDays).toBe(30);
  });

  it('sends only the new message, locale and local date', async () => {
    chat.mockResolvedValueOnce(reply('Seven days.'));
    const { result } = await renderLoaded('uk');

    act(() => result.current.send('  Яка моя серія?  '));

    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(chat).toHaveBeenCalledWith({
      message: 'Яка моя серія?',
      locale: 'uk',
      today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(result.current.entries).toEqual([
      expect.objectContaining({ role: 'user', content: 'Яка моя серія?' }),
      expect.objectContaining({ role: 'assistant', content: 'Seven days.' }),
    ]);
    expect(result.current.error).toBeNull();
  });

  it('shows the question while the coach thinks', async () => {
    chat.mockReturnValueOnce(new Promise(() => undefined));
    const { result } = await renderLoaded();

    act(() => result.current.send('Help me plan'));

    await waitFor(() => expect(result.current.isSending).toBe(true));
    expect(result.current.entries).toEqual([
      expect.objectContaining({ role: 'user', content: 'Help me plan' }),
    ]);
  });

  it('keeps a failed question and sends it again on retry', async () => {
    chat
      .mockRejectedValueOnce(new ApiError(502, 'unavailable'))
      .mockResolvedValueOnce(reply('Here you go.'));
    const { result } = await renderLoaded();

    act(() => result.current.send('Help me plan'));
    await waitFor(() => expect(result.current.error).toBe('failed'));
    expect(result.current.entries).toHaveLength(1);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(result.current.error).toBeNull();
    expect(chat.mock.calls[1][0].message).toBe('Help me plan');
  });

  it('tells rate limits and a disabled coach apart', async () => {
    chat.mockRejectedValueOnce(new ApiError(429, 'Too many messages'));
    const limited = await renderLoaded();
    act(() => limited.result.current.send('Hi'));
    await waitFor(() =>
      expect(limited.result.current.error).toBe('rateLimited'),
    );

    chat.mockRejectedValueOnce(new ApiError(503, 'turned off'));
    const disabled = await renderLoaded();
    act(() => disabled.result.current.send('Hi'));
    await waitFor(() => expect(disabled.result.current.error).toBe('disabled'));
  });

  it('does not send before the conversation has loaded', () => {
    getConversation.mockReturnValue(new Promise(() => undefined));
    const { result } = renderCoach();

    act(() => result.current.send('Hi'));

    expect(result.current.isLoading).toBe(true);
    expect(chat).not.toHaveBeenCalled();
  });

  it('reports a failed load and loads again on retry', async () => {
    getConversation.mockRejectedValueOnce(new ApiError(500, 'down'));
    const { result } = renderCoach();

    await waitFor(() => expect(result.current.error).toBe('loadFailed'));
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(getConversation).toHaveBeenCalledTimes(2);
  });

  it('deletes the conversation when starting over', async () => {
    chat
      .mockRejectedValueOnce(new ApiError(502, 'unavailable'))
      .mockResolvedValueOnce(reply('Fresh start.'));
    deleteConversation.mockResolvedValueOnce(undefined);
    const { result } = await renderLoaded();
    act(() => result.current.send('Old question'));
    await waitFor(() => expect(result.current.error).toBe('failed'));

    await act(() => result.current.startOver());

    expect(deleteConversation).toHaveBeenCalledTimes(1);
    expect(result.current.entries).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('keeps the conversation when deleting fails', async () => {
    deleteConversation.mockRejectedValueOnce(new ApiError(500, 'down'));
    chat.mockResolvedValueOnce(reply('Ok'));
    const { result } = await renderLoaded();
    act(() => result.current.send('Hi'));
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    await act(() => result.current.startOver());

    await waitFor(() => expect(result.current.error).toBe('deleteFailed'));
    expect(result.current.entries).toHaveLength(2);
  });
});
