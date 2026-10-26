import type { ApiHabitProposal } from '@repo/api-client';

import type { CoachEntry, CoachErrorKind } from '@/lib/hooks/useCoach';

export type CoachChatProps = {
  entries: CoachEntry[];
  isLoading: boolean;
  isSending: boolean;
  isDeleting: boolean;
  /** Days the server keeps the chat after the last message, once known. */
  retentionDays: number | null;
  error: CoachErrorKind | null;
  onSend: (text: string) => void;
  onRetry: () => void;
  /** Deletes the saved conversation and starts a new one. */
  onStartOver: () => void;
  onAcceptProposal: (proposal: ApiHabitProposal) => Promise<void>;
};
