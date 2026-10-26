import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { EvalReport } from './runner';

// The committed reference result. Live runs are compared with it, so a
// prompt change that makes things worse fails the run.
export const BASELINE_PATH = path.join(__dirname, 'baseline.json');

// Fail when the overall pass rate is below this, whatever the baseline.
export const MIN_PASS_RATE = 0.8;

// Fail when the pass rate falls this far below the baseline. Replies vary
// from run to run, so a drop of one or two cases is treated as noise.
export const MAX_DROP = 0.05;

export type Baseline = Pick<
  EvalReport,
  | 'createdAt'
  | 'model'
  | 'promptVersion'
  | 'judgeModel'
  | 'judgePromptVersion'
  | 'repeat'
  | 'cases'
  | 'passRate'
  | 'byCategory'
  | 'bySplit'
  | 'judge'
>;

export interface Comparison {
  ok: boolean;
  failures: string[];
  // Category drops are shown but do not fail the run: with five or so cases
  // per category, one changed case already moves the rate by 20 points.
  warnings: string[];
}

export function toBaseline(report: EvalReport): Baseline {
  return {
    createdAt: report.createdAt,
    model: report.model,
    promptVersion: report.promptVersion,
    judgeModel: report.judgeModel,
    judgePromptVersion: report.judgePromptVersion,
    repeat: report.repeat,
    cases: report.cases,
    passRate: report.passRate,
    byCategory: report.byCategory,
    bySplit: report.bySplit,
    judge: report.judge,
  };
}

export function compareWithBaseline(
  report: EvalReport,
  baseline: Baseline | null,
  { minPassRate = MIN_PASS_RATE, maxDrop = MAX_DROP } = {},
): Comparison {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (report.passRate < minPassRate) {
    failures.push(
      `Pass rate ${percent(report.passRate)} is below the minimum ${percent(minPassRate)}`,
    );
  }

  if (baseline) {
    if (report.passRate < baseline.passRate - maxDrop) {
      failures.push(
        `Pass rate fell from ${percent(baseline.passRate)} (${baseline.promptVersion}) to ${percent(report.passRate)}`,
      );
    }

    for (const [category, now] of Object.entries(report.byCategory)) {
      const before = baseline.byCategory[category];
      if (before && now.runs && now.passRate < before.passRate - maxDrop) {
        warnings.push(
          `${category}: ${percent(before.passRate)} → ${percent(now.passRate)}`,
        );
      }
    }

    if (baseline.model !== report.model) {
      warnings.push(
        `Baseline used ${baseline.model}, this run used ${report.model}`,
      );
    }
  }

  return { ok: failures.length === 0, failures, warnings };
}

export function readBaseline(file = BASELINE_PATH): Baseline | null {
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, 'utf8')) as Baseline)
    : null;
}

export function writeBaseline(report: EvalReport, file = BASELINE_PATH): void {
  writeFileSync(file, `${JSON.stringify(toBaseline(report), null, 2)}\n`);
}

export function percent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
