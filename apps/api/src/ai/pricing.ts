import type { TokenUsage } from './guardrails/token-budget';

// USD per million tokens. Check current prices before trusting the totals.
// Shared by the usage report and the evals, so both estimate cost the same way.
export const PRICES: Record<
  string,
  { input: number; output: number; cacheRead: number; cacheWrite: number }
> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  'claude-sonnet-5-5': {
    input: 2,
    output: 10,
    cacheRead: 0.2,
    cacheWrite: 2.5,
  },
  'claude-haiku-5-5': {
    input: 0.1,
    output: 0.5,
    cacheRead: 0.01,
    cacheWrite: 0.125,
  },
};

// null for a model that is not in the table.
export function estimateCost(model: string, usage: TokenUsage): number | null {
  const price = PRICES[model];
  if (!price) {
    return null;
  }

  return (
    (usage.inputTokens * price.input +
      usage.outputTokens * price.output +
      usage.cacheReadTokens * price.cacheRead +
      usage.cacheWriteTokens * price.cacheWrite) /
    1_000_000
  );
}
