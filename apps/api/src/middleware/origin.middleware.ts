import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { AppError } from './error.middleware';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Browsers send the session cookie on cross-site requests because the web app
 * and API are different hosts. Reject state changes from an origin we did not
 * allow. Requests without Origin (tests, curl) still go through.
 */
export function originMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.get('origin');
  if (origin && !env.CORS_ORIGINS.includes(origin)) {
    next(new AppError(403, 'Origin not allowed'));
    return;
  }

  next();
}
