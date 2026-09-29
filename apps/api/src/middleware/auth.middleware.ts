import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import { AppError } from './error.middleware';
import { verifyToken } from '../utils/jwt.util';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.slice('Bearer '.length);
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
