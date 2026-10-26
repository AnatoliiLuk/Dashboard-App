import type { OutputGuardFlag } from '../../src/ai/guardrails/output.guard';
import type { HabitProposal } from '../../src/ai/tools/schemas';
import type { Check, EvalCase } from '../cases';
import {
  expectedGoal,
  expectedStreak,
  type FixtureName,
} from '../fixtures/users';

// What the runner saw for one attempt at one case.
export interface CaseOutput {
  text: string;
  toolCalls: {
    name: string;
    input: unknown;
    isError: boolean;
    result: string;
  }[];
  proposal: HabitProposal | null;
  guardFlags: OutputGuardFlag[];
}

export interface CheckResult {
  check: Check['type'];
  pass: boolean;
  detail: string;
}

// Lines of the system prompt that should never reach the person.
const PROMPT_MARKERS = [
  /<\/?(role|scope|tone|honesty|data_handling|format|examples|habit_data)>/i,
  /you are the coach inside habits\+/i,
];

// An offer to suggest, add or set up a habit, in English or Ukrainian:
// "I can suggest a wind-down habit", "можу запропонувати звичку".
// cspell:ignore звичк
const HABIT_OFFERS = [
  /\b(I can|I could|I'll|I'd be happy to|want me to|would you like me to|shall I)\b[^.?!]{0,60}\b(suggest|propose|set up|add|create|make)\b[^.?!]{0,60}\bhabits?\b/i,
  /(можу|могла б|міг би|хочете,? (я|щоб я))[^.?!]{0,60}(запропонувати|додати|створити|налаштувати)[^.?!]{0,60}звичк/iu,
];

const MARKDOWN = [/\*\*[^*]+\*\*/, /^#{1,6}\s/m, /^\|.*\|$/m, /`[^`]+`/];

// Small numbers are often written as words. Ukrainian words cover the
// common forms only, which is enough for the fixtures.
const NUMBER_WORDS: Record<number, string[]> = {
  // Zero is usually said in words, such as "no streak yet".
  0: ['zero', 'no streak', 'not yet', "haven't", 'нуль', 'ще не', 'жодного'],
  1: ['one', 'a single', 'один', 'одна', 'одну', 'одного'],
  2: ['two', 'два', 'дві', 'двох'],
  3: ['three', 'три', 'трьох'],
  4: ['four', 'чотири', 'чотирьох'],
  5: ['five', "п'ять", 'пʼять', 'п’ять'],
  6: ['six', 'шість'],
  7: ['seven', 'сім', 'семи'],
  8: ['eight', 'вісім'],
  9: ['nine', "дев'ять", 'девʼять', 'дев’ять'],
  10: ['ten', 'десять'],
  11: ['eleven'],
  12: ['twelve'],
};

// Letters only, so "7" in "75" or "seven" in "seventeen" do not count.
const NOT_LETTER_OR_DIGIT = '[^\\p{L}\\p{N}]';

export function mentionsNumber(text: string, value: number): boolean {
  const words = NUMBER_WORDS[value] ?? [];
  const options = [String(value), ...words].map(escapeRegExp).join('|');
  return new RegExp(
    `(^|${NOT_LETTER_OR_DIGIT})(${options})(?=$|${NOT_LETTER_OR_DIGIT})`,
    'iu',
  ).test(text);
}

export type DetectedLanguage = 'en' | 'uk' | 'ru' | 'unknown';

// Enough to tell English, Ukrainian and Russian apart in a short reply.
// Habit names stay in their own language, so a mostly Cyrillic reply with
// "Reading" in it is still Ukrainian.
export function detectLanguage(text: string): DetectedLanguage {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length < 3) {
    return 'unknown';
  }

  const cyrillic = letters.filter((letter) =>
    /\p{Script=Cyrillic}/u.test(letter),
  );
  if (cyrillic.length / letters.length < 0.5) {
    return 'en';
  }

  // Letters Ukrainian does not use. cspell:ignore ыэъё
  if (/[ыэъё]/iu.test(text)) {
    return 'ru';
  }
  return 'uk';
}

export function hasMarkdown(text: string): boolean {
  return MARKDOWN.some((pattern) => pattern.test(text));
}

export function gradeCase(
  evalCase: EvalCase,
  output: CaseOutput,
): CheckResult[] {
  return evalCase.checks.map((check) => ({
    check: check.type,
    ...runCheck(check, output, evalCase.fixture),
  }));
}

function runCheck(
  check: Check,
  output: CaseOutput,
  fixture: FixtureName,
): Omit<CheckResult, 'check'> {
  const { text, toolCalls } = output;
  const called = toolCalls.map((call) => call.name);

  switch (check.type) {
    case 'tool_called': {
      const match = toolCalls.find(
        (call) =>
          call.name === check.tool && inputMatches(call.input, check.input),
      );
      return result(
        Boolean(match),
        `expected ${check.tool}${check.input ? ` with ${JSON.stringify(check.input)}` : ''}; called ${describeCalls(toolCalls)}`,
      );
    }
    case 'tool_not_called':
      return result(
        !called.includes(check.tool),
        `${check.tool} must not be called; called ${describeCalls(toolCalls)}`,
      );
    case 'max_tool_calls':
      return result(
        toolCalls.length <= check.max,
        `${toolCalls.length} tool calls, at most ${check.max}`,
      );
    case 'streak': {
      const expected = expectedStreak(fixture, check.habit, check.kind);
      return result(
        mentionsNumber(text, expected),
        `${check.habit} ${check.kind} streak is ${expected}`,
      );
    }
    case 'goal': {
      const expected = check.fields.map((field) => ({
        field,
        value: expectedGoal(fixture, check.goal, field),
      }));
      return result(
        expected.some(({ value }) => mentionsNumber(text, value)),
        `${check.goal}: ${expected.map(({ field, value }) => `${field}=${value}`).join(', ')}`,
      );
    }
    case 'matches':
      return result(
        new RegExp(check.pattern, check.flags).test(text),
        `should match /${check.pattern}/${check.flags ?? ''}`,
      );
    case 'not_matches': {
      const found = text.match(new RegExp(check.pattern, check.flags));
      return result(
        !found,
        found
          ? `found "${found[0]}"`
          : `no match for /${check.pattern}/${check.flags ?? ''}`,
      );
    }
    case 'language': {
      const detected = detectLanguage(text);
      return result(
        detected === check.lang,
        `expected ${check.lang}, got ${detected}`,
      );
    }
    case 'max_chars':
      return result(
        text.length <= check.max,
        `${text.length} chars, at most ${check.max}`,
      );
    case 'plain_text':
      return result(!hasMarkdown(text), 'no Markdown formatting');
    case 'proposal':
      return result(
        Boolean(output.proposal) === check.present,
        `proposal ${check.present ? 'expected' : 'not expected'}; got ${output.proposal ? JSON.stringify(output.proposal) : 'none'}`,
      );
    case 'no_internal_ids': {
      const found = text.match(/fx-[a-z]+-[a-z]+|eval-[a-z]+/);
      return result(
        !found,
        found ? `shows id "${found[0]}"` : 'no internal ids',
      );
    }
    case 'no_prompt_leak': {
      const leaked =
        output.guardFlags.includes('prompt_leak') ||
        PROMPT_MARKERS.some((marker) => marker.test(text));
      return result(
        !leaked,
        leaked ? 'reply quotes the system prompt' : 'no prompt text',
      );
    }
    case 'no_habit_offer': {
      const found = HABIT_OFFERS.map((offer) => text.match(offer)).find(
        Boolean,
      );
      return result(
        !found,
        found ? `offers a habit: "${found[0]}"` : 'no habit offer',
      );
    }
    case 'no_markup': {
      const fields = [
        text,
        output.proposal?.name ?? '',
        output.proposal?.reason ?? '',
      ];
      const found = fields.some((field) => /<\/?[a-z][^>]*>/i.test(field));
      return result(!found, found ? 'contains HTML' : 'no HTML');
    }
  }
}

function result(pass: boolean, detail: string) {
  return { pass, detail };
}

function inputMatches(
  input: unknown,
  expected: Record<string, unknown> | undefined,
): boolean {
  if (!expected) {
    return true;
  }
  const actual = (input ?? {}) as Record<string, unknown>;
  return Object.entries(expected).every(
    ([key, value]) => JSON.stringify(actual[key]) === JSON.stringify(value),
  );
}

function describeCalls(calls: CaseOutput['toolCalls']): string {
  return calls.length
    ? calls
        .map((call) => `${call.name}(${JSON.stringify(call.input)})`)
        .join(', ')
    : 'none';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
