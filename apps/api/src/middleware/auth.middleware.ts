import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import { AppError } from './error.middleware';
import { UsersRepository } from '../repositories/users.repository';
import { verifyToken } from '../utils/jwt.util';
import { readSessionToken } from '../utils/session-cookie';

const users = new UsersRepository();

function bearerToken(header: string | undefined): string | undefined {
  if (!header?.startsWith('Bearer ')) {
    return undefined;
  }

  const token = header.slice('Bearer '.length).trim();
  return token || undefined;
}

export async function authMiddleware(
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

    const payload = verifyToken(token);

    // A deleted user, or a token issued before a password change, is no
    // longer a valid session (ADR 0002).
    const tokenVersion = await users.findTokenVersion(payload.id);
    if (tokenVersion === null || tokenVersion !== payload.ver) {
      throw new AppError(401, 'Invalid token');
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
      return;
    }

    next(error);
  }
}
