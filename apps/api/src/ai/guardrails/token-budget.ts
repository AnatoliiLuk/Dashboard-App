import { AppError } from '../../middleware/error.middleware';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface TokenBudget {
  assertAvailable(userId: string): void;
  record(userId: string, usage: TokenUsage): void;
}

// Cache reads cost a twentieth of normal input, so they do not count.
export function billableTokens(usage: TokenUsage): number {
  return usage.inputTokens + usage.cacheWriteTokens + usage.outputTokens;
}

// Per-user daily limit kept in memory. It resets on restart and is not
// shared between server instances; Phase 6 moves it to the AiUsage table.
export class InMemoryTokenBudget implements TokenBudget {
  private day = '';
  private used = new Map<string, number>();

  constructor(
    private dailyLimit: number,
    private now: () => Date = () => new Date(),
  ) {}

  assertAvailable(userId: string): void {
    if (this.usedToday(userId) >= this.dailyLimit) {
      throw new AppError(
        429,
        "You've reached today's limit for the AI coach. It resets at midnight UTC",
      );
    }
  }

  record(userId: string, usage: TokenUsage): void {
    this.rollOver();
    this.used.set(userId, (this.used.get(userId) ?? 0) + billableTokens(usage));
  }

  private usedToday(userId: string): number {
    this.rollOver();
    return this.used.get(userId) ?? 0;
  }

  private rollOver(): void {
    const today = this.now().toISOString().slice(0, 10);
    if (today !== this.day) {
      this.day = today;
      this.used.clear();
    }
  }
}
