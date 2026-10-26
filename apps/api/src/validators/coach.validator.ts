import { addDays, compareDates } from '@repo/core';
import { z } from 'zod';

import { COACH_LOCALES } from '../ai/prompts/coach.system';

export const COACH_MAX_MESSAGE_LENGTH = 2000;

// One new message. The server keeps the conversation, so the client cannot
// send or rewrite earlier turns, system prompts, tool calls or tool results.
export const coachChatSchema = z
  .object({
    message: z
      .string({ required_error: 'Message is required' })
      .trim()
      .min(1, 'Message cannot be empty')
      .max(
        COACH_MAX_MESSAGE_LENGTH,
        `Message must be at most ${COACH_MAX_MESSAGE_LENGTH} characters`,
      ),
    locale: z
      .enum(COACH_LOCALES, {
        errorMap: () => ({ message: 'Locale must be en or uk' }),
      })
      .default('en'),
    // The person's local date from the browser, so streaks match the UI.
    // Every time zone is within one day of UTC.
    today: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Today must be YYYY-MM-DD')
      .refine(isNearUtcToday, 'Today must be within one day of the server date')
      .optional(),
  })
  .strict();

export type CoachChatBody = z.infer<typeof coachChatSchema>;

function isNearUtcToday(value: string): boolean {
  const utcToday = new Date().toISOString().slice(0, 10);
  return (
    compareDates(value, addDays(utcToday, -1)) >= 0 &&
    compareDates(value, addDays(utcToday, 1)) <= 0
  );
}
