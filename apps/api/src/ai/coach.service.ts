import Anthropic from '@anthropic-ai/sdk';

import { AppError } from '../middleware/error.middleware';
import type { ModelClient } from './client';
import type { CoachContextSource } from './context.builder';
import { guardInput } from './guardrails/input.guard';
import {
  guardProposal,
  guardReply,
  type OutputGuardFlag,
} from './guardrails/output.guard';
import type { TokenBudget, TokenUsage } from './guardrails/token-budget';
import type { AiUsageRecord, UsageStore } from './usage.repository';
import { COACH_TOOLS } from './tools';
import type { CoachToolRunner } from './tools/handlers';
import type { HabitProposal } from './tools/schemas';
import {
  buildCoachSystem,
  COACH_PROMPT_VERSION,
  type CoachLocale,
} from './prompts/coach.system';

// Each round is one model call. Most answers need one or two.
const MAX_TOOL_ROUNDS = 5;

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
  userId: string;
  today: string;
}

export interface CoachReply {
  text: string;
  promptVersion: string;
  stopReason: Anthropic.StopReason | null;
  truncated: boolean;
  proposal: HabitProposal | null;
  toolCalls: number;
  guardFlags: OutputGuardFlag[];
  usage: CoachUsage;
}

// inputTokens is uncached input only. Cached input is in the cache fields.
export type CoachUsage = TokenUsage;

export interface CoachDependencies {
  client: ModelClient;
  tools: CoachToolRunner;
  context: CoachContextSource;
  budget: TokenBudget;
  usage: Pick<UsageStore, 'record'>;
}

// Counters that survive a failed run, so failures are recorded too.
interface RunStats {
  usage: CoachUsage;
  toolCalls: number;
}

export class CoachService {
  constructor(
    private deps: CoachDependencies,
    private config: CoachConfig,
  ) {}

  async reply(input: CoachReplyInput): Promise<CoachReply> {
    // Kill switch: checked first, so nothing else runs and nothing is spent.
    if (!this.config.enabled) {
      throw new AppError(503, 'The AI coach is turned off');
    }

    const started = Date.now();
    const stats: RunStats = {
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      toolCalls: 0,
    };
    let reply: CoachReply | undefined;
    let errorStatus: number | null = null;

    try {
      await this.deps.budget.assertAvailable(input.userId);
      reply = await this.run(input, stats);
      return reply;
    } catch (error) {
      errorStatus = error instanceof AppError ? error.statusCode : 500;
      throw error;
    } finally {
      await this.track(
        {
          userId: input.userId,
          model: this.config.model,
          promptVersion: COACH_PROMPT_VERSION,
          ...stats.usage,
          latencyMs: Date.now() - started,
          toolCalls: stats.toolCalls,
          status: statusOf(reply),
          errorStatus,
        },
        reply,
      );
    }
  }

  // One row and one log line per request. Metadata only, never messages.
  // A failed write is logged but never fails the person's request.
  private async track(row: AiUsageRecord, reply?: CoachReply): Promise<void> {
    console.log(
      JSON.stringify({
        event: 'ai_request',
        ...row,
        guardFlags: reply?.guardFlags ?? [],
      }),
    );

    try {
      await this.deps.usage.record(row);
    } catch (error) {
      console.error('Could not save AI usage:', error);
    }
  }

  private async run(
    { messages, locale, userId, today }: CoachReplyInput,
    stats: RunStats,
  ): Promise<CoachReply> {
    const { usage } = stats;
    const habitData = await this.deps.context.build(userId, today);
    const system = buildCoachSystem(locale, today, habitData);
    // The API is stateless: each round sends the whole conversation,
    // including earlier tool calls and their results.
    const conversation = guardInput(messages);
    let proposal: HabitProposal | null = null;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.callModel({
        model: this.config.model,
        max_tokens: this.config.maxOutputTokens,
        // Short chat replies do not need deep thinking.
        output_config: { effort: 'low' },
        system,
        tools: COACH_TOOLS,
        messages: [...conversation],
        // Also caches the conversation so far, so the next tool round
        // and the next turn reuse it.
        cache_control: { type: 'ephemeral' },
      });
      addUsage(usage, response.usage);

      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) {
        return this.finish(response, locale, {
          proposal,
          toolCalls: stats.toolCalls,
          usage,
        });
      }

      // Send the content back unchanged: it holds thinking blocks too.
      conversation.push({ role: 'assistant', content: response.content });

      const outcomes = await Promise.all(
        toolUses.map((block) => this.deps.tools.run(block, { userId, today })),
      );
      stats.toolCalls += outcomes.length;
      proposal =
        outcomes.filter((outcome) => outcome.proposal).at(-1)?.proposal ??
        proposal;

      // All results go back in one user message, matched by tool_use_id.
      conversation.push({
        role: 'user',
        content: outcomes.map((outcome) => outcome.result),
      });
    }

    console.error('Coach hit the tool round limit:', MAX_TOOL_ROUNDS);
    throw new AppError(502, 'The AI coach took too many steps to answer');
  }

  private finish(
    response: Anthropic.Message,
    locale: CoachLocale,
    run: Pick<CoachReply, 'proposal' | 'toolCalls' | 'usage'>,
  ): CoachReply {
    if (response.stop_reason === 'refusal') {
      return {
        ...run,
        text: REFUSAL_REPLIES[locale],
        promptVersion: COACH_PROMPT_VERSION,
        stopReason: response.stop_reason,
        truncated: false,
        // Do not show a proposal next to a refusal.
        proposal: null,
        guardFlags: [],
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

    const guarded = guardReply(text, locale);
    const leaked = guarded.flags.includes('prompt_leak');

    return {
      ...run,
      text: guarded.text,
      // Nothing from a reply that quoted the prompt reaches the person.
      proposal: leaked ? null : guardProposal(run.proposal),
      guardFlags: guarded.flags,
      promptVersion: COACH_PROMPT_VERSION,
      stopReason: response.stop_reason,
      truncated: response.stop_reason === 'max_tokens',
    };
  }

  private async callModel(
    params: Anthropic.MessageCreateParamsNonStreaming,
  ): Promise<Anthropic.Message> {
    try {
      return await this.deps.client.createMessage(params);
    } catch (error) {
      throw toAppError(error);
    }
  }
}

function statusOf(reply?: CoachReply): AiUsageRecord['status'] {
  if (!reply) {
    return 'error';
  }
  if (reply.stopReason === 'refusal') {
    return 'refusal';
  }
  return reply.truncated ? 'truncated' : 'ok';
}

function addUsage(total: CoachUsage, usage: Anthropic.Usage): void {
  total.inputTokens += usage.input_tokens;
  total.outputTokens += usage.output_tokens;
  total.cacheReadTokens += usage.cache_read_input_tokens ?? 0;
  total.cacheWriteTokens += usage.cache_creation_input_tokens ?? 0;
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
