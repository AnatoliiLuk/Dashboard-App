import type { ApiHabitProposal } from '@repo/api-client';

import type { CoachEntry, CoachErrorKind } from '@/lib/hooks/useCoach';

export type CoachChatProps = {
  entries: CoachEntry[];
  isSending: boolean;
  error: CoachErrorKind | null;
  onSend: (text: string) => void;
  onRetry: () => void;
  onAcceptProposal: (proposal: ApiHabitProposal) => Promise<void>;
};
