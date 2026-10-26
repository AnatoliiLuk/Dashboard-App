import { AppError } from '../../middleware/error.middleware';
import type { UsageStore } from '../usage.repository';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface TokenBudget {
  assertAvailable(userId: string): Promise<void>;
}

// Cache reads cost a twentieth of normal input, so they do not count.
export function billableTokens(usage: TokenUsage): number {
  return usage.inputTokens + usage.cacheWriteTokens + usage.outputTokens;
}

// Per-user daily limit read from the AiUsage table, so it survives restarts
// and is shared by every server instance. The day starts at midnight UTC.
export class DailyTokenBudget implements TokenBudget {
  constructor(
    private usage: Pick<UsageStore, 'billableTokensSince'>,
    private dailyLimit: number,
    private now: () => Date = () => new Date(),
  ) {}

  async assertAvailable(userId: string): Promise<void> {
    const used = await this.usage.billableTokensSince(
      userId,
      startOfUtcDay(this.now()),
    );

    if (used >= this.dailyLimit) {
      throw new AppError(
        429,
        "You've reached today's limit for the AI coach. It resets at midnight UTC",
      );
    }
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}
