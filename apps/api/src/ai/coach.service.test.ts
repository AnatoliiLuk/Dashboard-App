import { describe, expect, it, jest } from '@jest/globals';
import Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../middleware/error.middleware';
import type { ModelClient } from './client';
import { CoachService, type CoachConfig } from './coach.service';
import {
  buildCoachSystemPrompt,
  COACH_PROMPT_VERSION,
} from './prompts/coach.system';

const config: CoachConfig = {
  enabled: true,
  model: 'test-model',
  maxOutputTokens: 512,
};

const input = {
  messages: [{ role: 'user' as const, content: 'How do I read more?' }],
  locale: 'en' as const,
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

function fakeClient(result: Anthropic.Message | Error) {
  const createMessage = jest.fn<ModelClient['createMessage']>();
  if (result instanceof Error) {
    createMessage.mockRejectedValue(result);
  } else {
    createMessage.mockResolvedValue(result);
  }
  return { createMessage };
}

async function replyError(service: CoachService): Promise<AppError> {
  const error = await service.reply(input).catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(AppError);
  return error as AppError;
}

describe('CoachService', () => {
  it('returns the text and usage and sends the configured request', async () => {
    const client = fakeClient(message());
    const service = new CoachService(client, config);

    await expect(service.reply(input)).resolves.toEqual({
      text: 'Read ten pages a day.',
      promptVersion: COACH_PROMPT_VERSION,
      stopReason: 'end_turn',
      truncated: false,
      usage: { inputTokens: 12, outputTokens: 7 },
    });
    expect(client.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'test-model',
        max_tokens: 512,
        system: buildCoachSystemPrompt('en'),
        messages: input.messages,
      }),
    );
  });

  it('marks a reply cut off by max_tokens as truncated', async () => {
    const service = new CoachService(
      fakeClient(message({ stop_reason: 'max_tokens' })),
      config,
    );

    await expect(service.reply(input)).resolves.toEqual(
      expect.objectContaining({ truncated: true, stopReason: 'max_tokens' }),
    );
  });

  it('replaces a refusal with a fixed friendly reply', async () => {
    const service = new CoachService(
      fakeClient(message({ stop_reason: 'refusal', content: [] })),
      config,
    );

    const reply = await service.reply(input);

    expect(reply.stopReason).toBe('refusal');
    expect(reply.text).toMatch(/habits/);
  });

  it('gives the refusal reply in the requested locale', async () => {
    const service = new CoachService(
      fakeClient(message({ stop_reason: 'refusal', content: [] })),
      config,
    );

    const reply = await service.reply({ ...input, locale: 'uk' });

    expect(reply.text).toMatch(/звички/);
  });

  it('fails with 502 when the model returns no text', async () => {
    const service = new CoachService(
      fakeClient(message({ content: [] })),
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
    const service = new CoachService(fakeClient(providerError), config);

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
    const service = new CoachService(fakeClient(rateLimit), config);

    expect((await replyError(service)).statusCode).toBe(429);
  });

  it('maps a timeout to 504', async () => {
    const service = new CoachService(
      fakeClient(new Anthropic.APIConnectionTimeoutError()),
      config,
    );

    expect((await replyError(service)).statusCode).toBe(504);
  });

  it('returns 503 without calling the model when AI is disabled', async () => {
    const client = fakeClient(message());
    const service = new CoachService(client, { ...config, enabled: false });

    expect((await replyError(service)).statusCode).toBe(503);
    expect(client.createMessage).not.toHaveBeenCalled();
  });
});
