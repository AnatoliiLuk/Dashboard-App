// Tokens, latency and estimated cost per prompt version and model.
// Run: npm run usage:report -w @habit-tracker/api -- [days]   (default 30)
import { prisma } from '../config/database';

// USD per million tokens. Check current prices before trusting the totals.
const PRICES: Record<
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

interface Row {
  promptVersion: string;
  model: string;
  requests: number;
  errors: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  avgToolCalls: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

async function main() {
  const days = Number(process.argv[2] ?? 30);
  const since = new Date(Date.now() - days * 86_400_000);

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      "promptVersion",
      "model",
      COUNT(*)::int AS "requests",
      COUNT(*) FILTER (WHERE "status" = 'error')::int AS "errors",
      ROUND(AVG("latencyMs"))::int AS "avgLatencyMs",
      ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "latencyMs"))::int AS "p95LatencyMs",
      ROUND(AVG("toolCalls"), 2)::float AS "avgToolCalls",
      SUM("inputTokens")::int AS "inputTokens",
      SUM("outputTokens")::int AS "outputTokens",
      SUM("cacheReadTokens")::int AS "cacheReadTokens",
      SUM("cacheWriteTokens")::int AS "cacheWriteTokens"
    FROM "ai_usage"
    WHERE "createdAt" >= ${since}
    GROUP BY "promptVersion", "model"
    ORDER BY MIN("createdAt")
  `;

  console.log(`AI coach usage for the last ${days} days\n`);
  console.table(
    rows.map((row) => {
      const cost = estimateCost(row);
      return {
        prompt: row.promptVersion,
        model: row.model,
        requests: row.requests,
        errors: row.errors,
        'avg ms': row.avgLatencyMs,
        'p95 ms': row.p95LatencyMs,
        'tools/req': row.avgToolCalls,
        'in/req': Math.round(row.inputTokens / row.requests),
        'out/req': Math.round(row.outputTokens / row.requests),
        'cache read/req': Math.round(row.cacheReadTokens / row.requests),
        'cache write/req': Math.round(row.cacheWriteTokens / row.requests),
        'cost $': cost === null ? 'unknown model' : cost.toFixed(4),
        '$/req': cost === null ? '' : (cost / row.requests).toFixed(5),
      };
    }),
  );
}

function estimateCost(row: Row): number | null {
  const price = PRICES[row.model];
  if (!price) {
    return null;
  }

  return (
    (row.inputTokens * price.input +
      row.outputTokens * price.output +
      row.cacheReadTokens * price.cacheRead +
      row.cacheWriteTokens * price.cacheWrite) /
    1_000_000
  );
}

main().finally(() => prisma.$disconnect());
