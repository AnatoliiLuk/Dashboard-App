// Runs the coach eval set and compares it with the baseline.
//
//   npm run eval -w @habit-tracker/api                 live, needs a key
//   npm run eval -w @habit-tracker/api -- --offline    no key, tests the harness
//
// Options: --repeat N, --concurrency N, --case id[,id], --category name,
// --split dev|holdout, --no-judge, --judge-model id, --save-baseline,
// --min-pass-rate 0.8, --verbose (print every reply).
//
// Exit codes: 0 passed, 1 below the threshold or the baseline, 2 harness error.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { ModelClient } from '../src/ai/client';
import {
  compareWithBaseline,
  MIN_PASS_RATE,
  percent,
  readBaseline,
  writeBaseline,
} from './baseline';
import { CATEGORIES, loadCases, type EvalCase } from './cases';
import { offlineClient } from './offline.client';
import { runEvals, type CaseRun, type EvalReport } from './runner';

const REPORTS_DIR = path.join(__dirname, 'reports');

interface Args {
  offline: boolean;
  repeat: number;
  concurrency: number;
  caseIds: string[];
  category: string | null;
  split: EvalCase['split'] | null;
  judge: boolean;
  judgeModel: string | null;
  saveBaseline: boolean;
  minPassRate: number;
  verbose: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    offline: false,
    repeat: 1,
    concurrency: 4,
    caseIds: [],
    category: null,
    split: null,
    judge: true,
    judgeModel: null,
    saveBaseline: false,
    minPassRate: MIN_PASS_RATE,
    verbose: false,
  };

  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    const value = () => {
      const next = argv[++index];
      if (next === undefined) {
        throw new Error(`${flag} needs a value`);
      }
      return next;
    };

    switch (flag) {
      case '--offline':
        args.offline = true;
        break;
      case '--repeat':
        args.repeat = positiveInt(flag, value());
        break;
      case '--concurrency':
        args.concurrency = positiveInt(flag, value());
        break;
      case '--case':
        args.caseIds = value().split(',');
        break;
      case '--category':
        args.category = value();
        break;
      case '--split':
        args.split = value() === 'holdout' ? 'holdout' : 'dev';
        break;
      case '--no-judge':
        args.judge = false;
        break;
      case '--judge-model':
        args.judgeModel = value();
        break;
      case '--save-baseline':
        args.saveBaseline = true;
        break;
      case '--min-pass-rate':
        args.minPassRate = Number(value());
        break;
      case '--verbose':
        args.verbose = true;
        break;
      default:
        throw new Error(`Unknown option: ${flag}`);
    }
  }

  return args;
}

function positiveInt(flag: string, value: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${flag} must be a positive whole number`);
  }
  return number;
}

function selectCases(cases: EvalCase[], args: Args): EvalCase[] {
  if (
    args.category &&
    !(CATEGORIES as readonly string[]).includes(args.category)
  ) {
    throw new Error(`Unknown category: ${args.category}`);
  }
  const unknown = args.caseIds.filter((id) => !cases.some((c) => c.id === id));
  if (unknown.length) {
    throw new Error(`Unknown case: ${unknown.join(', ')}`);
  }

  return cases.filter(
    (evalCase) =>
      (!args.caseIds.length || args.caseIds.includes(evalCase.id)) &&
      (!args.category || evalCase.category === args.category) &&
      (!args.split || evalCase.split === args.split),
  );
}

// The live client reads the API key from env, so it is only loaded for
// live runs. Offline runs need no key and no database.
async function liveSetup(args: Args) {
  const [{ anthropicClient }, { env }] = await Promise.all([
    import('../src/ai/client'),
    import('../src/config/env'),
  ]);
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Use --offline to run without a key.',
    );
  }
  const client: ModelClient = anthropicClient;

  return {
    client,
    model: env.ANTHROPIC_MODEL,
    maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
    judge: args.judge
      ? { client, model: args.judgeModel ?? env.ANTHROPIC_MODEL }
      : null,
  };
}

function printRun(run: CaseRun, verbose: boolean): void {
  const mark = run.pass ? '✓' : '✗';
  const label = `${mark} ${run.id}${run.attempt > 1 ? ` #${run.attempt}` : ''}`;
  const lines = [label];

  if (run.error) {
    lines.push(`    error: ${run.error}`);
  }
  for (const check of run.checks.filter((check) => !check.pass)) {
    lines.push(`    ${check.check}: ${check.detail}`);
  }
  const verdict = run.judge?.verdict;
  if (verdict) {
    const scores = Object.entries(verdict)
      .map(([criterion, { score }]) => `${criterion} ${score}`)
      .join(', ');
    lines.push(
      `    judge: ${scores}${run.judge?.pass ? '' : ' (below the minimum)'}`,
    );
    if (!run.judge?.pass || verbose) {
      for (const [criterion, { score, reason }] of Object.entries(verdict)) {
        if (score < 4 || verbose) {
          lines.push(`      ${criterion}: ${reason}`);
        }
      }
    }
  }
  if (run.output && (verbose || !run.pass)) {
    const tools = run.output.toolCalls.map((call) => call.name).join(', ');
    lines.push(`    tools: ${tools || 'none'}`);
    lines.push(`    reply: ${run.output.text.replace(/\n/g, '\n           ')}`);
  }

  write(lines.join('\n'));
}

function printSummary(report: EvalReport): void {
  write(
    `\n${report.promptVersion} on ${report.model}` +
      (report.judgeModel
        ? `, judge ${report.judgePromptVersion} on ${report.judgeModel}`
        : '') +
      `, ${report.cases} cases × ${report.repeat}\n`,
  );
  console.table(
    Object.fromEntries(
      (
        [
          ...Object.entries(report.byCategory),
          ['dev', report.bySplit.dev],
          ['holdout', report.bySplit.holdout],
          ['overall', report.overall],
        ] as [string, EvalReport['overall']][]
      )
        .filter(([, rate]) => rate.runs)
        .map(([name, rate]) => [
          name,
          {
            passed: `${rate.passed}/${rate.runs}`,
            'pass rate': percent(rate.passRate),
          },
        ]),
    ),
  );

  const { averages } = report;
  write(
    `Per run: ${averages.inputTokens} in, ${averages.outputTokens} out, ` +
      `${averages.cacheReadTokens} cache read, ${averages.cacheWriteTokens} cache write, ` +
      `${averages.toolCalls} tool calls, ${averages.latencyMs} ms (p95 ${report.p95LatencyMs} ms)`,
  );
  if (report.judge) {
    const scores = Object.entries(report.judge.averages)
      .map(([criterion, score]) => `${criterion} ${score}`)
      .join(', ');
    write(
      `Judge: ${report.judge.passed}/${report.judge.runs - report.judge.errors} passed; average ${scores}`,
    );
  }
  if (report.estimatedCostUsd) {
    const cost = report.estimatedCostUsd;
    write(
      `Estimated cost: $${cost.total} (coach $${cost.coach}, judge $${cost.judge})`,
    );
  }
}

function saveReport(report: EvalReport): string {
  mkdirSync(REPORTS_DIR, { recursive: true });
  const name = report.mode === 'offline' ? 'offline.json' : 'latest.json';
  const json = `${JSON.stringify(report, null, 2)}\n`;
  writeFileSync(path.join(REPORTS_DIR, name), json);
  if (report.mode === 'live') {
    // A copy per run, to compare prompt versions later.
    const stamp = report.createdAt.replace(/[:.]/g, '-');
    writeFileSync(
      path.join(REPORTS_DIR, `${stamp}-${report.promptVersion}.json`),
      json,
    );
  }
  return path.join(REPORTS_DIR, name);
}

function write(text: string): void {
  process.stdout.write(`${text}\n`);
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const allCases = loadCases();
  const cases = selectCases(allCases, args);
  const partial = cases.length !== allCases.length;
  if (!cases.length) {
    throw new Error('No cases match the filters');
  }
  if (args.saveBaseline && (args.offline || partial)) {
    throw new Error('--save-baseline needs a live run of the full set');
  }

  const setup = args.offline
    ? {
        client: offlineClient(),
        model: 'offline',
        maxOutputTokens: 2048,
        judge: null,
      }
    : await liveSetup(args);

  write(
    `Running ${cases.length} cases × ${args.repeat} (${args.offline ? 'offline' : setup.model})\n`,
  );
  const report = await runEvals(cases, {
    mode: args.offline ? 'offline' : 'live',
    ...setup,
    repeat: args.repeat,
    concurrency: args.concurrency,
    onRun: (run) => printRun(run, args.verbose),
  });

  printSummary(report);
  write(`Report: ${path.relative(process.cwd(), saveReport(report))}`);

  if (report.harnessErrors.length) {
    write('\nHarness errors:');
    report.harnessErrors.forEach((error) => write(`  ${error}`));
    return 2;
  }

  // Offline replies are canned, so their pass rate means nothing.
  if (args.offline) {
    write('\nOffline run finished without harness errors.');
    return 0;
  }
  if (args.saveBaseline) {
    writeBaseline(report);
    write('\nSaved as the new baseline.');
    return 0;
  }
  if (partial) {
    write('\nPartial run: not compared with the baseline.');
    return 0;
  }

  const comparison = compareWithBaseline(report, readBaseline(), {
    minPassRate: args.minPassRate,
  });
  comparison.warnings.forEach((warning) => write(`Warning: ${warning}`));
  comparison.failures.forEach((failure) => write(`FAIL: ${failure}`));
  write(comparison.ok ? '\nPassed.' : '');
  return comparison.ok ? 0 : 1;
}

// The service logs one JSON line per request. Hide those so the eval
// output stays readable; the report has the same numbers.
const log = console.log.bind(console);
console.log = (...items: unknown[]) => {
  if (
    typeof items[0] === 'string' &&
    items[0].startsWith('{"event":"ai_request"')
  ) {
    return;
  }
  log(...items);
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  });
