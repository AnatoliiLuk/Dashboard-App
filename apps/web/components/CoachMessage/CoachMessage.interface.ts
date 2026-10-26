import type { ApiHabitProposal } from '@repo/api-client';

import type { CoachEntry } from '@/lib/hooks/useCoach';

export type CoachMessageProps = {
  entry: CoachEntry;
  onAcceptProposal: (proposal: ApiHabitProposal) => Promise<void>;
};
