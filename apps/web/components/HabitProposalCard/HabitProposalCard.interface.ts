import type { ApiHabitProposal } from '@repo/api-client';

export type ProposalState =
  'open' | 'adding' | 'added' | 'failed' | 'dismissed';

export type HabitProposalCardProps = {
  proposal: ApiHabitProposal;
  /** Creates the habit. The card only shows the result. */
  onAccept: (proposal: ApiHabitProposal) => Promise<void>;
};
