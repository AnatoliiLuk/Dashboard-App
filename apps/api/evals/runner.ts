import type { ModelClient } from '../src/ai/client';
import { CoachService } from '../src/ai/coach.service';
import { CoachContextBuilder } from '../src/ai/context.builder';
import type { TokenUsage } from '../src/ai/guardrails/token-budget';
import { estimateCost } from '../src/ai/pricing';
import { COACH_PROMPT_VERSION } from '../src/ai/prompts/coach.system';
import {
  CoachToolHandlers,
  type CoachToolRunner,
} from '../src/ai/tools/handlers';
import { AppError } from '../src/middleware/error.middleware';
import { CATEGORIES, type EvalCase } from './cases';
import { EVAL_TODAY, fixtureServices, fixtureUserId } from './fixtures/users';
import {
  gradeCase,
  type CaseOutput,
  type CheckResult,
} from './graders/deterministic';
import {
  JUDGE_CRITERIA,
  JUDGE_PROMPT_VERSION,
  judgeReply,
  type JudgeResult,
} from './graders/judge';

export interface RunOptions {
  mode: 'live' | 'offline';
  client: ModelClient;
  model: string;
  maxOutputTokens: number;
  // null skips the judge, for example offline or to save cost.
  judge: { client: ModelClient; model: string } | null;
  // Runs per case. Replies vary, so more runs give a steadier pass rate.
  repeat: number;
  concurrency: number;
  onRun?: (run: CaseRun) => void;
}

export interface CaseRun {
  id: string;
  category: EvalCase['category'];
  split: EvalCase['split'];
  attempt: number;
  pass: boolean;
  checks: CheckResult[];
  judge: JudgeResult | null;
  output: CaseOutput | null;
  // The coach failed to answer, for example the tool round limit.
  error: string | null;
  latencyMs: number;
  usage: TokenUsage;
}

interface PassRate {
  runs: number;
  passed: number;
  passRate: number;
}

export interface EvalReport {
  createdAt: string;
  mode: RunOptions['mode'];
  model: string;
  promptVersion: string;
  judgeModel: string | null;
  judgePromptVersion: string | null;
  repeat: number;
  cases: number;
  passRate: number;
  overall: PassRate;
  byCategory: Record<string, PassRate>;
  bySplit: Record<EvalCase['split'], PassRate>;
  judge: {
    runs: number;
    passed: number;
    errors: number;
    averages: Record<(typeof JUDGE_CRITERIA)[number], number>;
  } | null;
  averages: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    toolCalls: number;
    latencyMs: number;
  };
  p95LatencyMs: number;
  // null when a model is missing from the price table.
  estimatedCostUsd: { coach: number; judge: number; total: number } | null;
  // Problems with the harness itself, not with the coach's answers.
  harnessErrors: string[];
  runs: CaseRun[];
}

const NO_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
};

export async function runEvals(
  cases: EvalCase[],
  options: RunOptions,
): Promise<EvalReport> {
  const jobs = cases.flatMap((evalCase) =>
    Array.from({ length: options.repeat }, (_, attempt) => ({
      evalCase,
      attempt: attempt + 1,
    })),
  );
  const harnessErrors: string[] = [];

  const runs = await mapWithConcurrency(
    jobs,
    options.concurrency,
    async ({ evalCase, attempt }) => {
      const run = await runCase(evalCase, attempt, options, harnessErrors);
      options.onRun?.(run);
      return run;
    },
  );

  return summarize(cases, runs, options, harnessErrors);
}

async function runCase(
  evalCase: EvalCase,
  attempt: number,
  options: RunOptions,
  harnessErrors: string[],
): Promise<CaseRun> {
  const data = fixtureServices();
  const handlers = new CoachToolHandlers(data);
  const toolCalls: CaseOutput['toolCalls'] = [];
  // Records every call with its result, then runs the real handler.
  const tools: CoachToolRunner = {
    run: async (block, context) => {
      const outcome = await handlers.run(block, context);
      toolCalls.push({
        name: block.name,
        input: block.input,
        isError: Boolean(outcome.result.is_error),
        result: String(outcome.result.content),
      });
      return outcome;
    },
  };
  const service = new CoachService(
    {
      client: options.client,
      tools,
      context: new CoachContextBuilder(data),
      budget: { assertAvailable: async () => undefined },
      usage: { record: async () => undefined },
    },
    {
      enabled: true,
      model: options.model,
      maxOutputTokens: options.maxOutputTokens,
    },
  );
  const userId = fixtureUserId(evalCase.fixture);
  const base = {
    id: evalCase.id,
    category: evalCase.category,
    split: evalCase.split,
    attempt,
  };
  const started = Date.now();

  try {
    const reply = await service.reply({
      messages: evalCase.messages,
      locale: evalCase.locale,
      userId,
      today: EVAL_TODAY,
    });
    const latencyMs = Date.now() - started;
    const output: CaseOutput = {
      text: reply.text,
      toolCalls,
      proposal: reply.proposal,
      guardFlags: reply.guardFlags,
    };
    const checks = gradeCase(evalCase, output);

    let judge: JudgeResult | null = null;
    if (evalCase.judge && options.judge) {
      judge = await judgeReply(options.judge.client, options.judge.model, {
        evalCase,
        output,
        habitData: await new CoachContextBuilder(data).build(
          userId,
          EVAL_TODAY,
        ),
        today: EVAL_TODAY,
      });
      if (judge.error) {
        harnessErrors.push(
          `${evalCase.id}#${attempt}: judge failed: ${judge.error}`,
        );
      }
    }

    // A broken judge does not fail the reply: only real verdicts count.
    const judgePass = !judge || judge.error !== undefined || judge.pass;
    return {
      ...base,
      pass: checks.every((check) => check.pass) && judgePass,
      checks,
      judge,
      output,
      error: null,
      latencyMs,
      usage: reply.usage,
    };
  } catch (error) {
    // An AppError is the coach failing to answer, which fails the case.
    // Anything else is a bug in the coach or the harness.
    if (!(error instanceof AppError)) {
      harnessErrors.push(`${evalCase.id}#${attempt}: ${String(error)}`);
    }
    return {
      ...base,
      pass: false,
      checks: [],
      judge: null,
      output: null,
      error: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - started,
      usage: NO_USAGE,
    };
  }
}

function summarize(
  cases: EvalCase[],
  runs: CaseRun[],
  options: RunOptions,
  harnessErrors: string[],
): EvalReport {
  const judged = runs.filter((run) => run.judge?.verdict);
  const coachUsage = sumUsage(runs.map((run) => run.usage));
  const judgeUsage = sumUsage(
    runs.flatMap((run) => (run.judge ? [run.judge.usage] : [])),
  );
  const coachCost = estimateCost(options.model, coachUsage);
  const judgeCost = options.judge
    ? estimateCost(options.judge.model, judgeUsage)
    : 0;
  const latencies = runs.map((run) => run.latencyMs).sort((a, b) => a - b);
  const overall = passRate(runs);

  return {
    createdAt: new Date().toISOString(),
    mode: options.mode,
    model: options.model,
    promptVersion: COACH_PROMPT_VERSION,
    judgeModel: options.judge?.model ?? null,
    judgePromptVersion: options.judge ? JUDGE_PROMPT_VERSION : null,
    repeat: options.repeat,
    cases: cases.length,
    passRate: overall.passRate,
    overall,
    byCategory: Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        passRate(runs.filter((run) => run.category === category)),
      ]),
    ),
    bySplit: {
      dev: passRate(runs.filter((run) => run.split === 'dev')),
      holdout: passRate(runs.filter((run) => run.split === 'holdout')),
    },
    judge: options.judge
      ? {
          runs: runs.filter((run) => run.judge).length,
          passed: judged.filter((run) => run.judge?.pass).length,
          errors: runs.filter((run) => run.judge?.error).length,
          averages: Object.fromEntries(
            JUDGE_CRITERIA.map((criterion) => [
              criterion,
              round(
                average(
                  judged.map((run) => run.judge!.verdict![criterion].score),
                ),
              ),
            ]),
          ) as NonNullable<EvalReport['judge']>['averages'],
        }
      : null,
    averages: {
      inputTokens: round(average(runs.map((run) => run.usage.inputTokens))),
      outputTokens: round(average(runs.map((run) => run.usage.outputTokens))),
      cacheReadTokens: round(
        average(runs.map((run) => run.usage.cacheReadTokens)),
      ),
      cacheWriteTokens: round(
        average(runs.map((run) => run.usage.cacheWriteTokens)),
      ),
      toolCalls: round(
        average(runs.map((run) => run.output?.toolCalls.length ?? 0)),
      ),
      latencyMs: Math.round(average(latencies)),
    },
    p95LatencyMs: latencies[Math.ceil(latencies.length * 0.95) - 1] ?? 0,
    estimatedCostUsd:
      coachCost === null || judgeCost === null
        ? null
        : {
            coach: round(coachCost, 4),
            judge: round(judgeCost, 4),
            total: round(coachCost + judgeCost, 4),
          },
    harnessErrors,
    runs,
  };
}

function passRate(runs: CaseRun[]): PassRate {
  const passed = runs.filter((run) => run.pass).length;
  return {
    runs: runs.length,
    passed,
    passRate: runs.length ? round(passed / runs.length, 3) : 0,
  };
}

function sumUsage(items: TokenUsage[]): TokenUsage {
  return items.reduce(
    (total, usage) => ({
      inputTokens: total.inputTokens + usage.inputTokens,
      outputTokens: total.outputTokens + usage.outputTokens,
      cacheReadTokens: total.cacheReadTokens + usage.cacheReadTokens,
      cacheWriteTokens: total.cacheWriteTokens + usage.cacheWriteTokens,
    }),
    NO_USAGE,
  );
}

function average(values: number[]): number {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

// Runs a few cases at once: faster than one by one, and gentler on the
// API rate limit than all at once.
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}
