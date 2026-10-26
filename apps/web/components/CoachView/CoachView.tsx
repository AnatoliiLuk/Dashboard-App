'use client';

import type { ApiHabitProposal } from '@repo/api-client';

import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';
import { CoachChat } from '@/components/CoachChat';
import { useCoach } from '@/lib/hooks/useCoach';
import { useHabits } from '@/lib/hooks/useHabits';

export function CoachView() {
  return (
    <AppShell>
      <AuthGuard>
        <CoachContent />
      </AuthGuard>
    </AppShell>
  );
}

function CoachContent() {
  const { entries, send, retry, isSending, error } = useCoach();
  const { createHabit } = useHabits();

  // Accepting a proposal uses the normal create-habit flow, so the new
  // habit shows up in the log and the calendar like any other.
  async function acceptProposal({ name, color }: ApiHabitProposal) {
    await createHabit({ name, color });
  }

  return (
    <CoachChat
      entries={entries}
      isSending={isSending}
      error={error}
      onSend={send}
      onRetry={retry}
      onAcceptProposal={acceptProposal}
    />
  );
}
