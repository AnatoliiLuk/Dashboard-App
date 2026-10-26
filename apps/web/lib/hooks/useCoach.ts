'use client';

import { ApiError, type ApiHabitProposal } from '@repo/api-client';
import { today } from '@repo/core';
import type { CoachMessageDto } from '@repo/types';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { api } from '@/lib/api/client';
import { displayLocale, useTranslation } from '@/lib/i18n';

// The API accepts at most 20 messages and keeps the last 10 for the model.
const MAX_HISTORY = 20;

export type CoachEntry =
  | { id: number; role: 'user'; content: string }
  | {
      id: number;
      role: 'assistant';
      content: string;
      truncated: boolean;
      proposal: ApiHabitProposal | null;
    };

export type CoachErrorKind = 'rateLimited' | 'disabled' | 'failed';

/**
 * One conversation with the coach. It lives in memory only: the API is
 * stateless, so every request sends the recent history again.
 */
export function useCoach() {
  const { i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);
  const [entries, setEntries] = useState<CoachEntry[]>([]);
  const nextId = useRef(0);

  const chatMutation = useMutation({
    mutationFn: (history: CoachEntry[]) =>
      api.coach.chat({ messages: toMessages(history), locale, today: today() }),
  });

  async function ask(history: CoachEntry[]) {
    try {
      const { reply, truncated, proposal } =
        await chatMutation.mutateAsync(history);
      setEntries((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'assistant',
          content: reply,
          truncated,
          proposal,
        },
      ]);
    } catch {
      // Shown through `error`; the question stays so it can be retried.
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || chatMutation.isPending) return;

    const history: CoachEntry[] = [
      ...entries,
      { id: nextId.current++, role: 'user', content },
    ];
    setEntries(history);
    void ask(history);
  }

  function retry() {
    if (chatMutation.isPending || entries.at(-1)?.role !== 'user') return;
    void ask(entries);
  }

  return {
    entries,
    send,
    retry,
    isSending: chatMutation.isPending,
    error: chatMutation.error ? errorKind(chatMutation.error) : null,
  };
}

// The API wants plain text that starts with a user message.
function toMessages(entries: CoachEntry[]): CoachMessageDto[] {
  const recent = entries.slice(-MAX_HISTORY);
  const start = recent.findIndex((entry) => entry.role === 'user');

  return recent.slice(start).map(({ role, content }) => ({ role, content }));
}

function errorKind(error: Error): CoachErrorKind {
  if (error instanceof ApiError && error.status === 429) return 'rateLimited';
  if (error instanceof ApiError && error.status === 503) return 'disabled';
  return 'failed';
}
