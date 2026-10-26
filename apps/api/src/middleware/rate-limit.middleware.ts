import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';

import { AppError } from './error.middleware';

const ONE_MINUTE_MS = 60_000;

// Limits requests per signed-in user, not per IP, so people behind one
// network do not share a limit. Must run after authMiddleware.
export function userRateLimit(limitPerMinute: number): RequestHandler {
  return rateLimit({
    windowMs: ONE_MINUTE_MS,
    limit: limitPerMinute,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => req.user!.id,
    handler: (_req, _res, next) => {
      next(new AppError(429, 'Too many messages. Wait a minute and try again'));
    },
  });
}
