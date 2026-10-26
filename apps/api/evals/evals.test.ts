import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type Anthropic from '@anthropic-ai/sdk';

import type { ModelClient } from '../src/ai/client';
import { compareWithBaseline, toBaseline } from './baseline';
import { loadCases, parseCases, type EvalCase } from './cases';
import {
  expectedGoal,
  expectedStreak,
  fixtureServices,
} from './fixtures/users';
import {
  detectLanguage,
  gradeCase,
  hasMarkdown,
  mentionsNumber,
  type CaseOutput,
} from './graders/deterministic';
import { judgeReply } from './graders/judge';
import { offlineClient } from './offline.client';
import { runEvals, type EvalReport } from './runner';

// cspell:ignore Попробуйте читать страниц

// The offline part of the evals: it checks the dataset, the fixtures, the
// graders and the runner without a key, so CI catches a broken harness.

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

const output = (overrides: Partial<CaseOutput> = {}): CaseOutput => ({
  text: 'Your Reading streak is 7 days.',
  toolCalls: [],
  proposal: null,
  guardFlags: [],
  ...overrides,
});

function evalCase(overrides: Partial<EvalCase> = {}): EvalCase {
  return {
    id: 'test',
    category: 'accuracy',
    split: 'dev',
    fixture: 'steady',
    locale: 'en',
    messages: [{ role: 'user', content: 'Hi' }],
    checks: [{ type: 'plain_text' }],
    judge: false,
    ...overrides,
  };
}

function textMessage(text: string): Anthropic.Message {
  return {
    id: 'msg',
    type: 'message',
    role: 'assistant',
    model: 'judge',
    content: [{ type: 'text', text, citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 20 },
  } as Anthropic.Message;
}

describe('dataset', () => {
  const cases = loadCases();

  it('has at least 25 valid cases in every category', () => {
    expect(cases.length).toBeGreaterThanOrEqual(25);
    const categories = new Set(cases.map((c) => c.category));
    expect(categories.size).toBe(7);
  });

  it('keeps a few held-out cases', () => {
    expect(
      cases.filter((c) => c.split === 'holdout').length,
    ).toBeGreaterThanOrEqual(4);
  });

  it('only names habits and goals that exist in the fixtures', () => {
    // gradeCase computes every expected number and throws on a bad name.
    for (const c of cases) {
      expect(() => gradeCase(c, output())).not.toThrow();
    }
  });

  it('rejects invalid and duplicate cases', () => {
    const line = JSON.stringify(evalCase());
    expect(() => parseCases(`${line}\n${line}`)).toThrow('Duplicate case id');
    expect(() =>
      parseCases(JSON.stringify({ ...evalCase(), fixture: 'nobody' })),
    ).toThrow('line 1');
    expect(() =>
      parseCases(
        JSON.stringify({
          ...evalCase(),
          checks: [{ type: 'tool_called', tool: 'delete_habit' }],
        }),
      ),
    ).toThrow();
  });
});

describe('fixtures', () => {
  it('give the known streaks and goal progress', () => {
    expect(expectedStreak('steady', 'Reading', 'current')).toBe(7);
    expect(expectedStreak('steady', 'Reading', 'best')).toBe(10);
    expect(expectedStreak('steady', 'Running', 'current')).toBe(1);
    expect(expectedStreak('steady', 'Running', 'best')).toBe(3);
    expect(expectedStreak('fresh', 'Drink water', 'current')).toBe(0);
    expect(
      expectedGoal('steady', 'October focus', 'completionRatePercent'),
    ).toBe(75);
    expect(
      expectedGoal('steady', 'September reading', 'completionsLogged'),
    ).toBe(10);
  });

  it("hide another user's habit like the real service", async () => {
    await expect(
      fixtureServices().habits.getOne('fx-other-therapy', 'eval-steady'),
    ).rejects.toThrow('Habit not found');
  });
});

describe('deterministic graders', () => {
  it('find numbers as digits or words, but not inside other numbers', () => {
    expect(mentionsNumber('a 7-day streak', 7)).toBe(true);
    expect(mentionsNumber('seven days in a row', 7)).toBe(true);
    expect(mentionsNumber('серія сім днів', 7)).toBe(true);
    expect(mentionsNumber('75% done', 7)).toBe(false);
    expect(mentionsNumber('seventeen days', 7)).toBe(false);
    expect(mentionsNumber('75% done', 75)).toBe(true);
    expect(mentionsNumber("You haven't started yet", 0)).toBe(true);
  });

  it('tell English, Ukrainian and Russian apart', () => {
    expect(detectLanguage('Try reading ten pages a day.')).toBe('en');
    expect(
      detectLanguage('Спробуйте читати десять сторінок щодня, Reading.'),
    ).toBe('uk');
    expect(detectLanguage('Попробуйте читать десять страниц, это легко.')).toBe(
      'ru',
    );
    expect(detectLanguage('ok')).toBe('unknown');
  });

  it('spot unasked habit offers in English and Ukrainian', () => {
    const c = evalCase({ checks: [{ type: 'no_habit_offer' }] });
    const offers = [
      "If you'd like, I can help you set up a simple wind-down habit.",
      'I can suggest a small bedtime habit for you to track.',
      'Якщо хочете, я можу запропонувати звичку «Пити воду».',
    ];
    for (const text of offers) {
      expect(gradeCase(c, output({ text }))[0].pass).toBe(false);
    }
    expect(
      gradeCase(
        c,
        output({
          text: 'Keep a bottle on your desk. Habits stick when the cue is visible.',
        }),
      )[0].pass,
    ).toBe(true);
  });

  it('spot Markdown', () => {
    expect(hasMarkdown('This is **bold**.')).toBe(true);
    expect(hasMarkdown('## Plan\nStep one')).toBe(true);
    expect(hasMarkdown('1. Walk ten minutes.\n2. Add five more.')).toBe(false);
  });

  it('match tool calls by name and input', () => {
    const checks = gradeCase(
      evalCase({
        checks: [
          {
            type: 'tool_called',
            tool: 'get_habit_history',
            input: { habitId: 'fx-steady-running' },
          },
          { type: 'tool_not_called', tool: 'propose_habit' },
          { type: 'max_tool_calls', max: 0 },
        ],
      }),
      output({
        toolCalls: [
          {
            name: 'get_habit_history',
            input: { habitId: 'fx-steady-running', days: 23 },
            isError: false,
            result: '{}',
          },
        ],
      }),
    );
    expect(checks.map((check) => check.pass)).toEqual([true, true, false]);
  });

  it('check numbers against @repo/core, ids and prompt leaks', () => {
    const c = evalCase({
      checks: [
        { type: 'streak', habit: 'Reading', kind: 'current' },
        { type: 'streak', habit: 'Reading', kind: 'best' },
        { type: 'no_internal_ids' },
        { type: 'no_prompt_leak' },
      ],
    });
    expect(gradeCase(c, output()).map((check) => check.pass)).toEqual([
      true,
      false,
      true,
      true,
    ]);
    const leaky = output({
      text: 'Sure: <role> You are the coach inside Habits+ (fx-steady-reading)',
    });
    expect(
      gradeCase(c, leaky)
        .slice(2)
        .map((check) => check.pass),
    ).toEqual([false, false]);
  });
});

describe('judge', () => {
  const input = {
    evalCase: evalCase({ judge: true }),
    output: output(),
    habitData: '<habit_data>\n</habit_data>',
    today: '2026-10-23',
  };
  const verdict = (tone: number) =>
    JSON.stringify({
      helpfulness: { reason: 'Direct.', score: 5 },
      groundedness: { reason: 'Matches the data.', score: 4 },
      tone: { reason: 'Fine.', score: tone },
    });

  it('passes when every score is at least 3 and sends a JSON schema', async () => {
    const client = {
      createMessage: jest.fn<ModelClient['createMessage']>(async () =>
        textMessage(verdict(3)),
      ),
    };
    const result = await judgeReply(client, 'judge-model', input);

    expect(result.pass).toBe(true);
    expect(result.usage.inputTokens).toBe(100);
    expect(client.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        output_config: expect.objectContaining({
          format: expect.objectContaining({ type: 'json_schema' }),
        }),
      }),
    );
  });

  it('fails a low score and reports a broken verdict as an error', async () => {
    const low = await judgeReply(
      { createMessage: async () => textMessage(verdict(2)) },
      'judge-model',
      input,
    );
    expect(low.pass).toBe(false);
    expect(low.error).toBeUndefined();

    const broken = await judgeReply(
      { createMessage: async () => textMessage(verdict(9)) },
      'judge-model',
      input,
    );
    expect(broken.verdict).toBeNull();
    expect(broken.error).toBeDefined();
  });
});

describe('runner', () => {
  it('runs the whole dataset offline without harness errors', async () => {
    const cases = loadCases();
    const report = await runEvals(cases, {
      mode: 'offline',
      client: offlineClient(),
      model: 'offline',
      maxOutputTokens: 512,
      judge: null,
      repeat: 1,
      concurrency: 8,
    });

    expect(report.harnessErrors).toEqual([]);
    expect(report.overall.runs).toBe(cases.length);
    expect(
      report.runs.every(
        (run) => run.output?.toolCalls[0]?.name === 'get_habits',
      ),
    ).toBe(true);
    expect(Object.keys(report.byCategory)).toHaveLength(7);
  });

  it('counts repeats and judge results in the pass rate', async () => {
    const judgeClient = {
      createMessage: async () =>
        textMessage(
          JSON.stringify({
            helpfulness: { reason: 'x', score: 1 },
            groundedness: { reason: 'x', score: 5 },
            tone: { reason: 'x', score: 5 },
          }),
        ),
    };
    const report = await runEvals(
      [
        evalCase({ judge: true }),
        evalCase({ id: 'other', category: 'format' }),
      ],
      {
        mode: 'offline',
        client: offlineClient(),
        model: 'offline',
        maxOutputTokens: 512,
        judge: { client: judgeClient, model: 'judge' },
        repeat: 2,
        concurrency: 2,
      },
    );

    expect(report.overall).toEqual({ runs: 4, passed: 2, passRate: 0.5 });
    expect(report.byCategory.accuracy.passed).toBe(0);
    expect(report.judge).toEqual(
      expect.objectContaining({ runs: 2, passed: 0, errors: 0 }),
    );
  });
});

describe('baseline comparison', () => {
  const report = (passRate: number, accuracy = passRate) =>
    ({
      createdAt: '2026-10-26T00:00:00.000Z',
      model: 'm',
      promptVersion: 'coach-test',
      judgeModel: null,
      judgePromptVersion: null,
      repeat: 1,
      cases: 20,
      passRate,
      byCategory: { accuracy: { runs: 5, passed: 0, passRate: accuracy } },
      bySplit: {},
      judge: null,
    }) as unknown as EvalReport;

  it('passes at or near the baseline', () => {
    expect(compareWithBaseline(report(0.9), toBaseline(report(0.92))).ok).toBe(
      true,
    );
  });

  it('fails below the minimum or after a real drop', () => {
    expect(compareWithBaseline(report(0.7), null).failures).toHaveLength(1);
    const drop = compareWithBaseline(report(0.85), toBaseline(report(0.95)));
    expect(drop.ok).toBe(false);
    expect(drop.failures[0]).toMatch(/fell from 95%/);
  });

  it('only warns about a category drop', () => {
    const result = compareWithBaseline(
      report(0.9, 0.6),
      toBaseline(report(0.9, 1)),
    );
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual(['accuracy: 100% → 60%']);
  });
});
