import Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../middleware/error.middleware';
import type { ModelClient } from './client';

// Placeholder until Phase 2 adds the versioned prompt in ai/prompts.
export const COACH_SYSTEM_PROMPT =
  'You are a supportive habit coach in the Habits+ app. ' +
  'Help the user build and keep habits, goals and routines. ' +
  'Keep answers short: a few sentences unless asked for more.';

const REFUSAL_REPLY =
  "Sorry, I can't help with that. Let's talk about your habits.";

export interface CoachConfig {
  enabled: boolean;
  model: string;
  maxOutputTokens: number;
}

export interface CoachReplyInput {
  system: string;
  messages: Anthropic.MessageParam[];
}

export interface CoachReply {
  text: string;
  stopReason: Anthropic.StopReason | null;
  truncated: boolean;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class CoachService {
  constructor(
    private client: ModelClient,
    private config: CoachConfig,
  ) {}

  async reply({ system, messages }: CoachReplyInput): Promise<CoachReply> {
    if (!this.config.enabled) {
      throw new AppError(503, 'The AI coach is turned off');
    }

    const response = await this.callModel({
      model: this.config.model,
      max_tokens: this.config.maxOutputTokens,
      // Short chat replies do not need deep thinking.
      output_config: { effort: 'low' },
      system,
      messages,
    });

    const usage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };

    if (response.stop_reason === 'refusal') {
      return {
        text: REFUSAL_REPLY,
        stopReason: response.stop_reason,
        truncated: false,
        usage,
      };
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    if (!text) {
      throw new AppError(502, 'The AI coach returned an empty reply');
    }

    return {
      text,
      stopReason: response.stop_reason,
      truncated: response.stop_reason === 'max_tokens',
      usage,
    };
  }

  private async callModel(
    params: Anthropic.MessageCreateParamsNonStreaming,
  ): Promise<Anthropic.Message> {
    try {
      return await this.client.createMessage(params);
    } catch (error) {
      throw toAppError(error);
    }
  }
}

// Never pass provider messages to the client: they can leak internals.
function toAppError(error: unknown): unknown {
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new AppError(504, 'The AI coach took too long to answer');
  }

  if (error instanceof Anthropic.RateLimitError) {
    return new AppError(
      429,
      'The AI coach is busy right now. Try again in a minute',
    );
  }

  if (error instanceof Anthropic.APIError) {
    console.error(
      'AI provider error:',
      error.status ?? 'connection',
      error.message,
    );
    return new AppError(502, 'The AI coach is unavailable right now');
  }

  return error;
}
