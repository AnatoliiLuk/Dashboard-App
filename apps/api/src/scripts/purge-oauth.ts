// Deletes expired OAuth authorization codes and tokens (ADR 0004). They are
// already refused once expired; this only keeps the tables small. Run it
// daily from a scheduler.
// Run: npm run oauth:purge -w @habit-tracker/api
import { prisma } from '../config/database';
import { OAuthRepository } from '../repositories/oauth.repository';

async function main() {
  const now = new Date();
  const deleted = await new OAuthRepository().deleteExpired(now);

  console.log(
    JSON.stringify({
      event: 'oauth_expired_purged',
      codes: deleted.codes,
      tokens: deleted.tokens,
      before: now.toISOString(),
    }),
  );
}

main().finally(() => prisma.$disconnect());
