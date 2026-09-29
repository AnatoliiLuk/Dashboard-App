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
});

export const env = envSchema.parse(process.env);
