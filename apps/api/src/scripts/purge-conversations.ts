// Deletes coach conversations with no new message for
// AI_CONVERSATION_RETENTION_DAYS. Run it daily from a scheduler.
// Run: npm run coach:purge -w @habit-tracker/api
import { ConversationRepository } from '../ai/conversation.repository';
import { retentionCutoff } from '../ai/conversation.service';
import { env } from '../config/env';
import { prisma } from '../config/database';

async function main() {
  const cutoff = retentionCutoff(env.AI_CONVERSATION_RETENTION_DAYS);
  const deleted = await new ConversationRepository().deleteIdleSince(cutoff);

  console.log(
    JSON.stringify({
      event: 'coach_conversations_purged',
      deleted,
      cutoff: cutoff.toISOString(),
    }),
  );
}

main().finally(() => prisma.$disconnect());
