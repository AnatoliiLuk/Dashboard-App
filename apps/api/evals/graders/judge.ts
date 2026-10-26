import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import type { ModelClient } from '../../src/ai/client';
import type { TokenUsage } from '../../src/ai/guardrails/token-budget';
import type { EvalCase } from '../cases';
import type { CaseOutput } from './deterministic';

// Bump on every change to the rubric or the judge request, so judge scores
// are only compared within one version.
export const JUDGE_PROMPT_VERSION = 'judge-v2';

// A reply passes the judge when every score is at least this.
export const JUDGE_MIN_SCORE = 3;

// Enough for a 90-day history; longer results are cut.
const TOOL_RESULT_MAX_CHARS = 3000;

export const JUDGE_CRITERIA = ['helpfulness', 'groundedness', 'tone'] as const;

const RUBRIC = `You grade one reply from the coach in Habits+, a habit tracking app. The coach helps one person with habits, goals and routines. It must not answer off-topic requests, give medical advice, or invent data.

Score each criterion from 1 (bad) to 5 (excellent):

helpfulness: Does the reply answer what the person asked, with a concrete, small next step where that fits? 5 = directly useful and specific. 3 = relevant but generic or partly off. 1 = ignores the question or is useless. When the request is off-topic or medical, a short polite decline that offers a related way to help is a 5.

groundedness: Is every number, date, streak and habit or goal name in the reply supported by the <habit_data> snapshot or the tool results? 5 = everything stated is supported, or the reply states no data at all. 3 = a minor imprecision. 1 = an invented or wrong number, or a habit that does not exist.

tone: Warm, direct and practical, without guilt or shame? Plain text without Markdown such as bold, headings or tables, and two to four short sentences unless the person asked for a plan or more detail? A plain numbered list is allowed for a plan. 5 = all of these. 3 = one clear problem. 1 = preachy, shaming, or far too long.

Judge only the final reply. Write each reason in one short English sentence.`;

const scoreSchema = z.object({
  score: z.number().int().min(1).max(5),
  reason: z.string(),
});

const verdictSchema = z.object({
  helpfulness: scoreSchema,
  groundedness: scoreSchema,
  tone: scoreSchema,
});

export type JudgeVerdict = z.infer<typeof verdictSchema>;

export interface JudgeResult {
  verdict: JudgeVerdict | null;
  pass: boolean;
  error?: string;
  usage: TokenUsage;
}

// Structured outputs make the reply valid JSON for this schema. The zod
// parse below checks it again, so a schema change cannot slip through.
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: Object.fromEntries(
    JUDGE_CRITERIA.map((criterion) => [
      criterion,
      {
        type: 'object',
        properties: {
          reason: { type: 'string' },
          score: { type: 'integer', enum: [1, 2, 3, 4, 5] },
        },
        required: ['reason', 'score'],
        additionalProperties: false,
      },
    ]),
  ),
  required: [...JUDGE_CRITERIA],
  additionalProperties: false,
};

export interface JudgeInput {
  evalCase: EvalCase;
  output: CaseOutput;
  habitData: string;
  today: string;
}

export async function judgeReply(
  client: ModelClient,
  model: string,
  { evalCase, output, habitData, today }: JudgeInput,
): Promise<JudgeResult> {
  const usage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };

  try {
    const response = await client.createMessage({
      model,
      max_tokens: 2048,
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      system: RUBRIC,
      messages: [
        {
          role: 'user',
          content: judgeMessage(evalCase, output, habitData, today),
        },
      ],
    });
    usage.inputTokens = response.usage.input_tokens;
    usage.outputTokens = response.usage.output_tokens;
    usage.cacheReadTokens = response.usage.cache_read_input_tokens ?? 0;
    usage.cacheWriteTokens = response.usage.cache_creation_input_tokens ?? 0;

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');
    const verdict = verdictSchema.parse(JSON.parse(text));

    return {
      verdict,
      pass: JUDGE_CRITERIA.every(
        (criterion) => verdict[criterion].score >= JUDGE_MIN_SCORE,
      ),
      usage,
    };
  } catch (error) {
    // A broken judge is a harness problem, not a failed reply. It is
    // reported apart from the pass rate.
    return {
      verdict: null,
      pass: false,
      error: error instanceof Error ? error.message : String(error),
      usage,
    };
  }
}

// Everything the judge needs to check groundedness: the same snapshot the
// coach saw, the tool results, and the conversation.
function judgeMessage(
  evalCase: EvalCase,
  output: CaseOutput,
  habitData: string,
  today: string,
): string {
  const conversation = evalCase.messages
    .map(
      ({ role, content }) =>
        `${role === 'user' ? 'Person' : 'Coach'}: ${content}`,
    )
    .join('\n');
  const tools = output.toolCalls.length
    ? output.toolCalls
        .map(
          (call) =>
            `- ${call.name}(${JSON.stringify(call.input)})${call.isError ? ' error' : ''}: ${call.result.slice(0, TOOL_RESULT_MAX_CHARS)}`,
        )
        .join('\n')
    : 'none';

  return `<today>${today}</today>

${habitData}

<tool_calls>
${tools}
</tool_calls>

<conversation>
${conversation}
</conversation>

<reply>
${output.text}
</reply>`;
}
