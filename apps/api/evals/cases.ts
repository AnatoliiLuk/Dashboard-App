import { readFileSync } from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { COACH_LOCALES } from '../src/ai/prompts/coach.system';
import { TOOL_NAMES } from '../src/ai/tools';
import { FIXTURE_NAMES } from './fixtures/users';

export const DATASET_PATH = path.join(
  __dirname,
  'dataset',
  'coach.cases.jsonl',
);

export const CATEGORIES = [
  'accuracy',
  'tool_use',
  'language',
  'scope',
  'injection',
  'format',
  'edge',
] as const;

const toolName = z.enum(Object.values(TOOL_NAMES) as [string, ...string[]]);

const pattern = z.object({
  pattern: z.string().min(1),
  flags: z.string().optional(),
});

// Every check is deterministic: code decides pass or fail, no model.
export const checkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('tool_called'),
    tool: toolName,
    // Each listed field must equal the tool input's field.
    input: z.record(z.unknown()).optional(),
  }),
  z.object({ type: z.literal('tool_not_called'), tool: toolName }),
  z.object({ type: z.literal('max_tool_calls'), max: z.number().int().min(0) }),
  z.object({
    type: z.literal('streak'),
    habit: z.string(),
    kind: z.enum(['current', 'best']),
  }),
  z.object({
    type: z.literal('goal'),
    goal: z.string(),
    // Passes if the reply states any one of these numbers.
    fields: z
      .array(
        z.enum([
          'day',
          'totalDays',
          'daysLeft',
          'completionsLogged',
          'completionsPossible',
          'completionRatePercent',
        ]),
      )
      .min(1),
  }),
  z.object({ type: z.literal('matches'), ...pattern.shape }),
  z.object({ type: z.literal('not_matches'), ...pattern.shape }),
  z.object({ type: z.literal('language'), lang: z.enum(COACH_LOCALES) }),
  z.object({ type: z.literal('max_chars'), max: z.number().int().positive() }),
  z.object({ type: z.literal('plain_text') }),
  z.object({ type: z.literal('proposal'), present: z.boolean() }),
  z.object({ type: z.literal('no_internal_ids') }),
  z.object({ type: z.literal('no_prompt_leak') }),
  z.object({ type: z.literal('no_markup') }),
  // No unasked offer to suggest, add or set up a habit.
  z.object({ type: z.literal('no_habit_offer') }),
]);

export type Check = z.infer<typeof checkSchema>;

export const caseSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    category: z.enum(CATEGORIES),
    // dev cases are used to tune the prompt. holdout cases are only
    // reported, so a tuned prompt is also checked on cases it never saw.
    split: z.enum(['dev', 'holdout']).default('dev'),
    fixture: z.enum(FIXTURE_NAMES),
    locale: z.enum(COACH_LOCALES),
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().min(1),
        }),
      )
      .min(1),
    checks: z.array(checkSchema).min(1),
    // Also ask the LLM judge for helpfulness, groundedness and tone.
    judge: z.boolean().default(false),
    note: z.string().optional(),
  })
  .strict();

export type EvalCase = z.infer<typeof caseSchema>;

export function parseCases(text: string): EvalCase[] {
  const cases = text
    .split('\n')
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => line && !line.startsWith('//'))
    .map(({ line, number }) => {
      try {
        return caseSchema.parse(JSON.parse(line));
      } catch (error) {
        throw new Error(`Invalid case on line ${number}: ${String(error)}`);
      }
    });

  const ids = new Set<string>();
  for (const { id } of cases) {
    if (ids.has(id)) {
      throw new Error(`Duplicate case id: ${id}`);
    }
    ids.add(id);
  }

  return cases;
}

export function loadCases(file = DATASET_PATH): EvalCase[] {
  return parseCases(readFileSync(file, 'utf8'));
}
