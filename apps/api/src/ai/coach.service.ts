import Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../middleware/error.middleware';
import type { ModelClient } from './client';
import {
  buildCoachSystemPrompt,
  COACH_PROMPT_VERSION,
  type CoachLocale,
} from './prompts/coach.system';

const REFUSAL_REPLIES: Record<CoachLocale, string> = {
  en: "Sorry, I can't help with that. Let's talk about your habits.",
  uk: 'Вибачте, з цим я не допоможу. Поговорімо про ваші звички.',
};

export interface CoachConfig {
  enabled: boolean;
  model: string;
  maxOutputTokens: number;
}

export interface CoachReplyInput {
  messages: Anthropic.MessageParam[];
  locale: CoachLocale;
}

export interface CoachReply {
  text: string;
  promptVersion: string;
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

  async reply({ messages, locale }: CoachReplyInput): Promise<CoachReply> {
    if (!this.config.enabled) {
      throw new AppError(503, 'The AI coach is turned off');
    }

    const response = await this.callModel({
      model: this.config.model,
      max_tokens: this.config.maxOutputTokens,
      // Short chat replies do not need deep thinking.
      output_config: { effort: 'low' },
      system: buildCoachSystemPrompt(locale),
      messages,
    });

    const usage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };

    if (response.stop_reason === 'refusal') {
      return {
        text: REFUSAL_REPLIES[locale],
        promptVersion: COACH_PROMPT_VERSION,
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
      promptVersion: COACH_PROMPT_VERSION,
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
