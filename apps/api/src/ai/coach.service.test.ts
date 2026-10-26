import { describe, expect, it, jest } from '@jest/globals';
import Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../middleware/error.middleware';
import type { ModelClient } from './client';
import { CoachService, type CoachConfig } from './coach.service';
import { HISTORY_MAX_MESSAGES } from './guardrails/input.guard';
import { buildCoachSystem, COACH_PROMPT_VERSION } from './prompts/coach.system';
import { COACH_TOOLS } from './tools';
import type { CoachToolRunner } from './tools/handlers';

const config: CoachConfig = {
  enabled: true,
  model: 'test-model',
  maxOutputTokens: 512,
};

const input = {
  messages: [{ role: 'user' as const, content: 'How do I read more?' }],
  locale: 'en' as const,
  userId: 'user-a',
  today: '2026-10-23',
};

function message(
  overrides: Partial<Anthropic.Message> = {},
): Anthropic.Message {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'test-model',
    content: [{ type: 'text', text: 'Read ten pages a day.', citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 12, output_tokens: 7 },
    ...overrides,
  } as Anthropic.Message;
}

function toolUse(
  id: string,
  name: string,
  toolInput: Record<string, unknown> = {},
): Anthropic.Message {
  return message({
    stop_reason: 'tool_use',
    content: [
      { type: 'text', text: 'Let me check.', citations: null },
      { type: 'tool_use', id, name, input: toolInput },
    ] as Anthropic.ContentBlock[],
  });
}

function fakeClient(...results: (Anthropic.Message | Error)[]) {
  const createMessage = jest.fn<ModelClient['createMessage']>();
  for (const result of results) {
    if (result instanceof Error) {
      createMessage.mockRejectedValueOnce(result);
    } else {
      createMessage.mockResolvedValueOnce(result);
    }
  }
  return { createMessage };
}

function fakeTools(
  outcome: Partial<Awaited<ReturnType<CoachToolRunner['run']>>> = {},
) {
  const run = jest.fn<CoachToolRunner['run']>(async (block) => ({
    result: {
      type: 'tool_result',
      tool_use_id: block.id,
      content: '{"ok":true}',
    },
    ...outcome,
  }));
  return { run };
}

const HABIT_DATA =
  '<habit_data>\nActive habits: 0\nActive goals: 0\n</habit_data>';

function fakeContext() {
  return { build: jest.fn(async () => HABIT_DATA) };
}

function fakeBudget() {
  return { assertAvailable: jest.fn(), record: jest.fn() };
}

async function replyError(service: CoachService): Promise<AppError> {
  const error = await service.reply(input).catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(AppError);
  return error as AppError;
}

describe('CoachService', () => {
  it('returns the text and usage and sends the configured request', async () => {
    const client = fakeClient(message());
    const service = new CoachService(
      client,
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    await expect(service.reply(input)).resolves.toEqual({
      text: 'Read ten pages a day.',
      promptVersion: COACH_PROMPT_VERSION,
      stopReason: 'end_turn',
      truncated: false,
      proposal: null,
      toolCalls: 0,
      guardFlags: [],
      usage: {
        inputTokens: 12,
        outputTokens: 7,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
    });
    expect(client.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'test-model',
        max_tokens: 512,
        system: buildCoachSystem('en', '2026-10-23', HABIT_DATA),
        tools: COACH_TOOLS,
        messages: input.messages,
        cache_control: { type: 'ephemeral' },
      }),
    );
  });

  it('builds the context for the session user and today', async () => {
    const context = fakeContext();
    const service = new CoachService(
      fakeClient(message()),
      fakeTools(),
      context,
      fakeBudget(),
      config,
    );

    await service.reply(input);

    expect(context.build).toHaveBeenCalledWith('user-a', '2026-10-23');
  });

  it('marks the stable instructions for caching and keeps the data after them', async () => {
    const client = fakeClient(message());
    const service = new CoachService(
      client,
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    await service.reply(input);

    const [stable, perRequest] = client.createMessage.mock.calls[0][0]
      .system as Anthropic.TextBlockParam[];
    expect(stable.cache_control).toEqual({ type: 'ephemeral' });
    expect(stable.text).not.toContain('2026-10-23');
    expect(perRequest.cache_control).toBeUndefined();
    expect(perRequest.text).toContain(HABIT_DATA);
  });

  it('sums cache reads and writes across rounds', async () => {
    const usage = (read: number, write: number) =>
      ({
        input_tokens: 10,
        output_tokens: 5,
        cache_read_input_tokens: read,
        cache_creation_input_tokens: write,
      }) as Anthropic.Usage;
    const service = new CoachService(
      fakeClient(
        { ...toolUse('toolu_1', 'get_habits'), usage: usage(2000, 300) },
        { ...message(), usage: usage(2300, 50) },
      ),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    const reply = await service.reply(input);

    expect(reply.usage).toEqual({
      inputTokens: 20,
      outputTokens: 10,
      cacheReadTokens: 4300,
      cacheWriteTokens: 350,
    });
  });

  it('sends only the most recent messages', async () => {
    const long = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `message ${i}`,
    }));
    const client = fakeClient(message());
    const service = new CoachService(
      client,
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    await service.reply({ ...input, messages: long });

    const sent = client.createMessage.mock.calls[0][0].messages;
    expect(sent.length).toBeLessThanOrEqual(HISTORY_MAX_MESSAGES);
    expect(sent[0].role).toBe('user');
    expect(sent.at(-1)).toEqual(long.at(-1));
  });

  it('runs a requested tool and sends its result back before answering', async () => {
    const first = toolUse('toolu_1', 'get_habits');
    const client = fakeClient(
      first,
      message({
        content: [
          { type: 'text', text: 'Your streak is 4 days.', citations: null },
        ],
      }),
    );
    const tools = fakeTools();
    const service = new CoachService(
      client,
      tools,
      fakeContext(),
      fakeBudget(),
      config,
    );

    const reply = await service.reply(input);

    expect(reply.text).toBe('Your streak is 4 days.');
    expect(reply.toolCalls).toBe(1);
    expect(reply.usage).toEqual(
      expect.objectContaining({ inputTokens: 24, outputTokens: 14 }),
    );
    expect(tools.run).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'toolu_1', name: 'get_habits' }),
      { userId: 'user-a', today: '2026-10-23' },
    );

    const secondCall = client.createMessage.mock.calls[1][0];
    expect(secondCall.messages).toEqual([
      ...input.messages,
      { role: 'assistant', content: first.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: 'toolu_1',
            content: '{"ok":true}',
          },
        ],
      },
    ]);
  });

  it('returns all parallel tool results in one user message', async () => {
    const parallel = message({
      stop_reason: 'tool_use',
      content: [
        { type: 'tool_use', id: 'toolu_1', name: 'get_habits', input: {} },
        { type: 'tool_use', id: 'toolu_2', name: 'get_goals', input: {} },
      ] as Anthropic.ContentBlock[],
    });
    const client = fakeClient(parallel, message());
    const service = new CoachService(
      client,
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    const reply = await service.reply(input);

    const results = client.createMessage.mock.calls[1][0].messages.at(-1);
    expect(reply.toolCalls).toBe(2);
    expect(results?.role).toBe('user');
    expect(results?.content).toEqual([
      expect.objectContaining({ tool_use_id: 'toolu_1' }),
      expect.objectContaining({ tool_use_id: 'toolu_2' }),
    ]);
  });

  it('returns the proposal from propose_habit', async () => {
    const proposal = {
      name: 'Read 10 pages',
      color: 'sky' as const,
      reason: 'Small and easy to keep.',
    };
    const service = new CoachService(
      fakeClient(toolUse('toolu_1', 'propose_habit', proposal), message()),
      fakeTools({ proposal }),
      fakeContext(),
      fakeBudget(),
      config,
    );

    await expect(service.reply(input)).resolves.toEqual(
      expect.objectContaining({ proposal }),
    );
  });

  it('stops with 502 when the model keeps calling tools', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = fakeClient(
      ...Array.from({ length: 10 }, (_, i) =>
        toolUse(`toolu_${i}`, 'get_habits'),
      ),
    );
    const tools = fakeTools();
    const service = new CoachService(
      client,
      tools,
      fakeContext(),
      fakeBudget(),
      config,
    );

    const error = await replyError(service);

    expect(error.statusCode).toBe(502);
    expect(client.createMessage).toHaveBeenCalledTimes(5);
    expect(tools.run).toHaveBeenCalledTimes(5);
  });

  it('marks a reply cut off by max_tokens as truncated', async () => {
    const service = new CoachService(
      fakeClient(message({ stop_reason: 'max_tokens' })),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    await expect(service.reply(input)).resolves.toEqual(
      expect.objectContaining({ truncated: true, stopReason: 'max_tokens' }),
    );
  });

  it('replaces a refusal with a fixed friendly reply and drops any proposal', async () => {
    const proposal = { name: 'Run', color: 'green' as const, reason: 'Fit.' };
    const service = new CoachService(
      fakeClient(
        toolUse('toolu_1', 'propose_habit', proposal),
        message({ stop_reason: 'refusal', content: [] }),
      ),
      fakeTools({ proposal }),
      fakeContext(),
      fakeBudget(),
      config,
    );

    const reply = await service.reply(input);

    expect(reply.stopReason).toBe('refusal');
    expect(reply.text).toMatch(/habits/);
    expect(reply.proposal).toBeNull();
  });

  it('gives the refusal reply in the requested locale', async () => {
    const service = new CoachService(
      fakeClient(message({ stop_reason: 'refusal', content: [] })),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    const reply = await service.reply({ ...input, locale: 'uk' });

    expect(reply.text).toMatch(/звички/);
  });

  it('fails with 502 when the model returns no text', async () => {
    const service = new CoachService(
      fakeClient(message({ content: [] })),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    expect((await replyError(service)).statusCode).toBe(502);
  });

  it('maps a provider error to 502 without leaking its message', async () => {
    const providerError = new Anthropic.InternalServerError(
      500,
      undefined,
      'secret upstream details',
      new Headers(),
    );
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = new CoachService(
      fakeClient(providerError),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    const error = await replyError(service);

    expect(error.statusCode).toBe(502);
    expect(error.message).not.toContain('secret');
  });

  it('maps a rate limit to 429', async () => {
    const rateLimit = new Anthropic.RateLimitError(
      429,
      undefined,
      'rate limited',
      new Headers(),
    );
    const service = new CoachService(
      fakeClient(rateLimit),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    expect((await replyError(service)).statusCode).toBe(429);
  });

  it('maps a timeout to 504', async () => {
    const service = new CoachService(
      fakeClient(new Anthropic.APIConnectionTimeoutError()),
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      config,
    );

    expect((await replyError(service)).statusCode).toBe(504);
  });

  it('returns 503 without calling the model when AI is disabled', async () => {
    const client = fakeClient(message());
    const service = new CoachService(
      client,
      fakeTools(),
      fakeContext(),
      fakeBudget(),
      {
        ...config,
        enabled: false,
      },
    );

    expect((await replyError(service)).statusCode).toBe(503);
    expect(client.createMessage).not.toHaveBeenCalled();
  });
});
