import { z } from 'zod';

import { COACH_LOCALES } from '../ai/prompts/coach.system';

export const COACH_MAX_MESSAGES = 20;
export const COACH_MAX_MESSAGE_LENGTH = 2000;

// Only plain user and assistant text. The client cannot send system
// prompts, tool calls or tool results.
const coachMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant'], {
      errorMap: () => ({ message: 'Role must be user or assistant' }),
    }),
    content: z
      .string()
      .trim()
      .min(1, 'Message cannot be empty')
      .max(
        COACH_MAX_MESSAGE_LENGTH,
        `Message must be at most ${COACH_MAX_MESSAGE_LENGTH} characters`,
      ),
  })
  .strict();

export const coachChatSchema = z
  .object({
    messages: z
      .array(coachMessageSchema)
      .min(1, 'At least one message is required')
      .max(
        COACH_MAX_MESSAGES,
        `At most ${COACH_MAX_MESSAGES} messages are allowed`,
      ),
    locale: z
      .enum(COACH_LOCALES, {
        errorMap: () => ({ message: 'Locale must be en or uk' }),
      })
      .default('en'),
  })
  .strict()
  .refine((data) => data.messages[0]?.role === 'user', {
    message: 'The first message must be from the user',
  })
  .refine((data) => data.messages.at(-1)?.role === 'user', {
    message: 'The last message must be from the user',
  });

export type CoachChatBody = z.infer<typeof coachChatSchema>;
