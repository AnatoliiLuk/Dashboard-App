import type Anthropic from '@anthropic-ai/sdk';

export const HISTORY_MAX_MESSAGES = 10;
export const HISTORY_MAX_CHARS = 1000;

// Tag names the system prompt uses to mark instructions and data. A message
// that contains them could pass itself off as a data block or a rule.
const RESERVED_TAGS = [
  'role',
  'scope',
  'tone',
  'honesty',
  'data_handling',
  'format',
  'examples',
  'example',
  'user',
  'coach',
  'language',
  'today',
  'habit_data',
  'system',
];

const RESERVED_TAG_PATTERN = new RegExp(
  `<\\s*/?\\s*(${RESERVED_TAGS.join('|')})\\b[^<>]*>`,
  'gi',
);

// Runs after the zod validator, which already allows only user and
// assistant text within length limits. Both roles come from the client,
// so both are guarded.
export function guardInput(
  messages: Anthropic.MessageParam[],
): Anthropic.MessageParam[] {
  return capHistory(messages.map(neutralizeMessage));
}

export function neutralizeReservedTags(text: string): string {
  return text.replace(RESERVED_TAG_PATTERN, (tag) => tag.replace(/[<>]/g, ''));
}

function neutralizeMessage(
  message: Anthropic.MessageParam,
): Anthropic.MessageParam {
  return typeof message.content === 'string'
    ? { ...message, content: neutralizeReservedTags(message.content) }
    : message;
}

// Keep the conversation small and predictable: the last few messages,
// starting with a user turn, and long older messages shortened.
export function capHistory(
  messages: Anthropic.MessageParam[],
): Anthropic.MessageParam[] {
  let kept = messages.slice(-HISTORY_MAX_MESSAGES);
  while (kept.length > 1 && kept[0].role !== 'user') {
    kept = kept.slice(1);
  }

  return kept.map((message, index) =>
    index === kept.length - 1 ? message : shorten(message),
  );
}

function shorten(message: Anthropic.MessageParam): Anthropic.MessageParam {
  if (
    typeof message.content !== 'string' ||
    message.content.length <= HISTORY_MAX_CHARS
  ) {
    return message;
  }

  return {
    ...message,
    content: `${message.content.slice(0, HISTORY_MAX_CHARS)}…`,
  };
}
