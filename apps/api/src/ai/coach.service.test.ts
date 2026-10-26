import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../middleware/error.middleware';
import type { ModelClient } from './client';
import { CoachService, type CoachConfig } from './coach.service';
import { HISTORY_MAX_MESSAGES } from './guardrails/input.guard';
import { buildCoachSystem, COACH_PROMPT_VERSION } from './prompts/coach.system';
import { COACH_TOOLS } from './tools';
import type { CoachToolRunner } from './tools/handlers';
import type { AiUsageRecord } from './usage.repository';

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
  return { assertAvailable: jest.fn(async () => undefined) };
}

function fakeUsage() {
  return { record: jest.fn(async (_row: AiUsageRecord) => undefined) };
}

// The service logs one line per request; keep test output quiet.
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

async function replyError(service: CoachService): Promise<AppError> {
  const error = await service.reply(input).catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(AppError);
  return error as AppError;
}

describe('CoachService', () => {
  it('returns the text and usage and sends the configured request', async () => {
    const client = fakeClient(message());
    const service = new CoachService(
      {
        client: client,
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: fakeClient(message()),
        tools: fakeTools(),
        context: context,
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    await service.reply(input);

    expect(context.build).toHaveBeenCalledWith('user-a', '2026-10-23');
  });

  it('marks the stable instructions for caching and keeps the data after them', async () => {
    const client = fakeClient(message());
    const service = new CoachService(
      {
        client: client,
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: fakeClient(
          { ...toolUse('toolu_1', 'get_habits'), usage: usage(2000, 300) },
          { ...message(), usage: usage(2300, 50) },
        ),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: client,
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: client,
        tools: tools,
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: client,
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: fakeClient(
          toolUse('toolu_1', 'propose_habit', proposal),
          message(),
        ),
        tools: fakeTools({ proposal }),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: client,
        tools: tools,
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    const error = await replyError(service);

    expect(error.statusCode).toBe(502);
    expect(client.createMessage).toHaveBeenCalledTimes(5);
    expect(tools.run).toHaveBeenCalledTimes(5);
  });

  it('marks a reply cut off by max_tokens as truncated', async () => {
    const service = new CoachService(
      {
        client: fakeClient(message({ stop_reason: 'max_tokens' })),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    await expect(service.reply(input)).resolves.toEqual(
      expect.objectContaining({ truncated: true, stopReason: 'max_tokens' }),
    );
  });

  it('replaces a refusal with a fixed friendly reply and drops any proposal', async () => {
    const proposal = { name: 'Run', color: 'green' as const, reason: 'Fit.' };
    const service = new CoachService(
      {
        client: fakeClient(
          toolUse('toolu_1', 'propose_habit', proposal),
          message({ stop_reason: 'refusal', content: [] }),
        ),
        tools: fakeTools({ proposal }),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    const reply = await service.reply(input);

    expect(reply.stopReason).toBe('refusal');
    expect(reply.text).toMatch(/habits/);
    expect(reply.proposal).toBeNull();
  });

  it('gives the refusal reply in the requested locale', async () => {
    const service = new CoachService(
      {
        client: fakeClient(message({ stop_reason: 'refusal', content: [] })),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    const reply = await service.reply({ ...input, locale: 'uk' });

    expect(reply.text).toMatch(/звички/);
  });

  it('fails with 502 when the model returns no text', async () => {
    const service = new CoachService(
      {
        client: fakeClient(message({ content: [] })),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: fakeClient(providerError),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
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
      {
        client: fakeClient(rateLimit),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    expect((await replyError(service)).statusCode).toBe(429);
  });

  it('maps a timeout to 504', async () => {
    const service = new CoachService(
      {
        client: fakeClient(new Anthropic.APIConnectionTimeoutError()),
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      config,
    );

    expect((await replyError(service)).statusCode).toBe(504);
  });

  it('returns 503 without calling the model when AI is disabled', async () => {
    const client = fakeClient(message());
    const service = new CoachService(
      {
        client: client,
        tools: fakeTools(),
        context: fakeContext(),
        budget: fakeBudget(),
        usage: fakeUsage(),
      },
      {
        ...config,
        enabled: false,
      },
    );

    expect((await replyError(service)).statusCode).toBe(503);
    expect(client.createMessage).not.toHaveBeenCalled();
  });

  describe('usage tracking', () => {
    function tracked(client: ModelClient, budget = fakeBudget()) {
      const usage = fakeUsage();
      const service = new CoachService(
        { client, tools: fakeTools(), context: fakeContext(), budget, usage },
        config,
      );
      return { service, usage };
    }

    it('records one row with tokens, tool calls and latency on success', async () => {
      const { service, usage } = tracked(
        fakeClient(toolUse('toolu_1', 'get_habits'), message()),
      );

      await service.reply(input);

      expect(usage.record).toHaveBeenCalledTimes(1);
      expect(usage.record.mock.calls[0][0]).toEqual({
        userId: 'user-a',
        model: 'test-model',
        promptVersion: COACH_PROMPT_VERSION,
        inputTokens: 24,
        outputTokens: 14,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        latencyMs: expect.any(Number),
        toolCalls: 1,
        status: 'ok',
        errorStatus: null,
      });
    });

    it('records a failed request with its error status and the tokens it spent', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const { service, usage } = tracked(
        fakeClient(
          toolUse('toolu_1', 'get_habits'),
          new Anthropic.APIConnectionTimeoutError(),
        ),
      );

      await service.reply(input).catch(() => undefined);

      expect(usage.record.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          status: 'error',
          errorStatus: 504,
          inputTokens: 12,
          toolCalls: 1,
        }),
      );
    });

    it('records refusals and truncated replies with their own status', async () => {
      const refused = tracked(
        fakeClient(message({ stop_reason: 'refusal', content: [] })),
      );
      const cut = tracked(fakeClient(message({ stop_reason: 'max_tokens' })));

      await refused.service.reply(input);
      await cut.service.reply(input);

      expect(refused.usage.record.mock.calls[0][0].status).toBe('refusal');
      expect(cut.usage.record.mock.calls[0][0].status).toBe('truncated');
    });

    it('records a request blocked by the budget, without calling the model', async () => {
      const client = fakeClient(message());
      const budget = {
        assertAvailable: jest.fn(async () => {
          throw new AppError(429, 'limit');
        }),
      };
      const { service, usage } = tracked(client, budget);

      await service.reply(input).catch(() => undefined);

      expect(client.createMessage).not.toHaveBeenCalled();
      expect(usage.record.mock.calls[0][0]).toEqual(
        expect.objectContaining({ status: 'error', errorStatus: 429 }),
      );
    });

    it('still answers when saving usage fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const usage = {
        record: jest.fn(async () => {
          throw new Error('database down');
        }),
      };
      const service = new CoachService(
        {
          client: fakeClient(message()),
          tools: fakeTools(),
          context: fakeContext(),
          budget: fakeBudget(),
          usage,
        },
        config,
      );

      await expect(service.reply(input)).resolves.toEqual(
        expect.objectContaining({ text: 'Read ten pages a day.' }),
      );
    });

    it('logs one line of metadata with the user id but no message content', async () => {
      const log = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);
      const { service } = tracked(fakeClient(message()));

      await service.reply(input);

      expect(log).toHaveBeenCalledTimes(1);
      const line = JSON.parse(log.mock.calls[0][0] as string);
      expect(line).toEqual(
        expect.objectContaining({
          event: 'ai_request',
          userId: 'user-a',
          model: 'test-model',
          status: 'ok',
          guardFlags: [],
        }),
      );
      expect(log.mock.calls[0][0]).not.toContain('How do I read more?');
      expect(log.mock.calls[0][0]).not.toContain('Read ten pages');
    });

    it('records nothing when the kill switch is off', async () => {
      const client = fakeClient(message());
      const usage = fakeUsage();
      const service = new CoachService(
        {
          client,
          tools: fakeTools(),
          context: fakeContext(),
          budget: fakeBudget(),
          usage,
        },
        { ...config, enabled: false },
      );

      await service.reply(input).catch(() => undefined);

      expect(client.createMessage).not.toHaveBeenCalled();
      expect(usage.record).not.toHaveBeenCalled();
    });
  });
});
