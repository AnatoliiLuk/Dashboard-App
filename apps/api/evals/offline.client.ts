import type Anthropic from '@anthropic-ai/sdk';

import type { ModelClient } from '../src/ai/client';
import { TOOL_NAMES } from '../src/ai/tools';

// Stands in for the model so the harness runs without a key, for example
// in CI. Every conversation takes one tool round through the real handlers
// and ends with the same short reply. The replies are not meant to pass the
// checks: offline runs test the harness, not the coach.
export function offlineClient(): ModelClient {
  return {
    createMessage: async (params) => {
      const lastMessage = params.messages.at(-1);
      const afterTools =
        Array.isArray(lastMessage?.content) &&
        lastMessage.content.some((block) => block.type === 'tool_result');

      return afterTools ? reply() : toolCall();
    },
  };
}

function toolCall(): Anthropic.Message {
  return message('tool_use', [
    {
      type: 'tool_use',
      id: 'toolu_offline',
      name: TOOL_NAMES.getHabits,
      input: {},
    } as Anthropic.ToolUseBlock,
  ]);
}

function reply(): Anthropic.Message {
  return message('end_turn', [
    {
      type: 'text',
      text: 'Offline reply. Pick one small step for today.',
      citations: null,
    },
  ]);
}

function message(
  stopReason: Anthropic.StopReason,
  content: Anthropic.ContentBlock[],
): Anthropic.Message {
  return {
    id: 'msg_offline',
    type: 'message',
    role: 'assistant',
    model: 'offline',
    content,
    stop_reason: stopReason,
    stop_sequence: null,
    usage: { input_tokens: 0, output_tokens: 0 },
  } as unknown as Anthropic.Message;
}
