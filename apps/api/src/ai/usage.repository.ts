import type { AiUsageStatus } from '@prisma/client';

import { prisma } from '../config/database';

export interface AiUsageRecord {
  userId: string;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  latencyMs: number;
  toolCalls: number;
  status: AiUsageStatus;
  errorStatus: number | null;
}

export interface UsageStore {
  record(row: AiUsageRecord): Promise<void>;
  billableTokensSince(userId: string, since: Date): Promise<number>;
}

export class AiUsageRepository implements UsageStore {
  async record(row: AiUsageRecord): Promise<void> {
    await prisma.aiUsage.create({ data: row });
  }

  // Same rule as billableTokens(): cache reads are left out.
  async billableTokensSince(userId: string, since: Date): Promise<number> {
    const { _sum } = await prisma.aiUsage.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { inputTokens: true, cacheWriteTokens: true, outputTokens: true },
    });

    return (
      (_sum.inputTokens ?? 0) +
      (_sum.cacheWriteTokens ?? 0) +
      (_sum.outputTokens ?? 0)
    );
  }
}
