'use client';

import {
  ApiError,
  type ApiCoachConversation,
  type ApiCoachMessage,
  type ApiHabitProposal,
} from '@repo/api-client';
import { today } from '@repo/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { api } from '@/lib/api/client';
import { coachKeys } from '@/lib/api/query-keys';
import { useAuth } from '@/lib/hooks/useAuth';
import { displayLocale, useTranslation } from '@/lib/i18n';

export type CoachEntry =
  | { id: string; role: 'user'; content: string }
  | {
      id: string;
      role: 'assistant';
      content: string;
      truncated: boolean;
      proposal: ApiHabitProposal | null;
    };

export type CoachErrorKind =
  'rateLimited' | 'disabled' | 'failed' | 'loadFailed' | 'deleteFailed';

/**
 * The person's one ongoing conversation with the coach. The server keeps
 * it, so it survives a reload. Only the question waiting for an answer
 * lives here, so a failed question can be sent again.
 */
export function useCoach() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const locale = displayLocale(i18n.resolvedLanguage ?? i18n.language);
  const [pending, setPending] = useState<string | null>(null);
  const nextId = useRef(0);

  const conversationQuery = useQuery({
    queryKey: coachKeys.conversation,
    queryFn: () => api.coach.getConversation(),
    enabled: isAuthenticated,
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      api.coach.chat({ message, locale, today: today() }),
    onSuccess: ({ reply, truncated, proposal }, message) => {
      // The server saved both turns. Add them here without a refetch.
      appendMessages([
        localMessage({ role: 'user', content: message }),
        localMessage({
          role: 'assistant',
          content: reply,
          truncated,
          proposal,
        }),
      ]);
      setPending(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.coach.deleteConversation(),
    onSuccess: () => {
      queryClient.setQueryData<ApiCoachConversation>(
        coachKeys.conversation,
        (current) => current && { ...current, messages: [] },
      );
      setPending(null);
      chatMutation.reset();
    },
  });

  function localMessage(
    message: Omit<ApiCoachMessage, 'id' | 'truncated' | 'proposal'> &
      Partial<ApiCoachMessage>,
  ): ApiCoachMessage {
    return {
      id: `local-${nextId.current++}`,
      truncated: false,
      proposal: null,
      ...message,
    };
  }

  function appendMessages(messages: ApiCoachMessage[]) {
    queryClient.setQueryData<ApiCoachConversation>(
      coachKeys.conversation,
      (current) =>
        current && { ...current, messages: [...current.messages, ...messages] },
    );
  }

  const isReady = conversationQuery.isSuccess;
  const isBusy = chatMutation.isPending || deleteMutation.isPending;

  function send(text: string) {
    const content = text.trim();
    if (!content || !isReady || isBusy || pending !== null) return;

    setPending(content);
    chatMutation.mutate(content);
  }

  function retry() {
    if (conversationQuery.isError) {
      void conversationQuery.refetch();
      return;
    }
    if (deleteMutation.isError) {
      void startOver();
      return;
    }
    if (isBusy || pending === null) return;
    chatMutation.mutate(pending);
  }

  // Deletes the saved conversation on the server and starts over.
  async function startOver() {
    if (isBusy) return;
    try {
      await deleteMutation.mutateAsync();
    } catch {
      // Shown through `error`.
    }
  }

  const saved = conversationQuery.data?.messages ?? [];
  const entries: CoachEntry[] = saved.map(toEntry);
  if (pending !== null) {
    entries.push({ id: 'pending', role: 'user', content: pending });
  }

  let error: CoachErrorKind | null = null;
  if (conversationQuery.isError) error = 'loadFailed';
  else if (deleteMutation.isError) error = 'deleteFailed';
  else if (chatMutation.error) error = errorKind(chatMutation.error);

  return {
    entries,
    send,
    retry,
    startOver,
    // A disabled query is pending too; only count it while signed in.
    isLoading: conversationQuery.isPending && isAuthenticated,
    isSending: chatMutation.isPending,
    isDeleting: deleteMutation.isPending,
    retentionDays: conversationQuery.data?.retentionDays ?? null,
    error,
  };
}

function toEntry(message: ApiCoachMessage): CoachEntry {
  const { id, role, content, truncated, proposal } = message;
  return role === 'user'
    ? { id, role, content }
    : { id, role, content, truncated, proposal };
}

function errorKind(error: Error): CoachErrorKind {
  if (error instanceof ApiError && error.status === 429) return 'rateLimited';
  if (error instanceof ApiError && error.status === 503) return 'disabled';
  return 'failed';
}
