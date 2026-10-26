import path from 'node:path';

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: path.resolve(__dirname, '../../../../.env'),
});
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3001')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().min(1).default('claude-opus-5-5'),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(2048),
  AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),
  // Per user per day: uncached input + cache writes + output tokens.
  AI_DAILY_TOKEN_BUDGET: z.coerce.number().int().positive().default(100_000),
  // z.coerce.boolean() would turn the string "false" into true.
  AI_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

export const env = envSchema
  .superRefine((data, ctx) => {
    if (
      data.NODE_ENV !== 'test' &&
      data.AI_ENABLED &&
      !data.ANTHROPIC_API_KEY
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ANTHROPIC_API_KEY'],
        message: 'ANTHROPIC_API_KEY is required unless AI_ENABLED=false',
      });
    }
  })
  .parse(process.env);
