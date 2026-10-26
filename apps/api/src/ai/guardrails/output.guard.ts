import { COACH_RULES, type CoachLocale } from '../prompts/coach.system';
import { proposeHabitInput, type HabitProposal } from '../tools/schemas';

export const MAX_REPLY_CHARS = 4000;

// A rule sentence this long is specific enough that the model only
// produces it by quoting the system prompt.
const LEAK_SENTENCE_MIN_CHARS = 40;

const LEAK_REPLIES: Record<CoachLocale, string> = {
  en: "I can't share how I'm set up, but I'm happy to help with your habits and goals.",
  uk: 'Я не можу розповідати про свої налаштування, але радо допоможу з вашими звичками та цілями.',
};

const RULE_SENTENCES = COACH_RULES.split('\n')
  .filter((line) => !line.startsWith('<'))
  .flatMap((line) => line.split(/(?<=[.!?])\s+/))
  // Without the final full stop, so a quote that drops it still matches.
  .map((sentence) => normalize(sentence).replace(/[.!?]+$/, ''))
  .filter((sentence) => sentence.length >= LEAK_SENTENCE_MIN_CHARS);

// Anything shaped like an HTML or XML tag, including our prompt tags.
const TAG_PATTERN = /<\/?[a-z][\w-]*(?:\s[^<>]*)?\/?>/gi;

// Control characters other than tab and newline.
const CONTROL_PATTERN = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

export type OutputGuardFlag = 'prompt_leak' | 'markup_removed' | 'truncated';

export interface GuardedOutput {
  text: string;
  flags: OutputGuardFlag[];
}

// The model is an untrusted component: treat its reply like user input
// before it reaches the person.
export function guardReply(text: string, locale: CoachLocale): GuardedOutput {
  if (leaksRules(text)) {
    return { text: LEAK_REPLIES[locale], flags: ['prompt_leak'] };
  }

  const flags: OutputGuardFlag[] = [];
  let safe = text.replace(CONTROL_PATTERN, '');

  const withoutTags = safe.replace(TAG_PATTERN, '');
  if (withoutTags !== safe) {
    flags.push('markup_removed');
    safe = withoutTags;
  }

  if (safe.length > MAX_REPLY_CHARS) {
    flags.push('truncated');
    safe = `${safe.slice(0, MAX_REPLY_CHARS)}…`;
  }

  return { text: safe.trim(), flags };
}

// The handler already validated the proposal. Checking again here keeps
// the response safe even if a later change skips that step.
export function guardProposal(
  proposal: HabitProposal | null,
): HabitProposal | null {
  if (!proposal) {
    return null;
  }

  const parsed = proposeHabitInput.safeParse({
    ...proposal,
    name: stripTags(proposal.name),
    reason: stripTags(proposal.reason),
  });

  return parsed.success ? parsed.data : null;
}

function leaksRules(text: string): boolean {
  const reply = normalize(text);
  return RULE_SENTENCES.some((sentence) => reply.includes(sentence));
}

// Case and spacing do not hide a quote.
function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function stripTags(value: string): string {
  return value.replace(TAG_PATTERN, '').replace(CONTROL_PATTERN, '');
}
