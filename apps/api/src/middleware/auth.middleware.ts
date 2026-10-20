import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import { AppError } from './error.middleware';
import { verifyToken } from '../utils/jwt.util';
import { readSessionToken } from '../utils/session-cookie';

function bearerToken(header: string | undefined): string | undefined {
  if (!header?.startsWith('Bearer ')) {
    return undefined;
  }

  const token = header.slice('Bearer '.length).trim();
  return token || undefined;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token =
      bearerToken(req.headers.authorization) ??
      readSessionToken(req.headers.cookie);

    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    req.user = verifyToken(token);
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
      return;
    }

    next(error);
  }
}
