import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import { AppError } from './error.middleware';
import { UsersRepository } from '../repositories/users.repository';
import { verifyToken, type TokenPayload } from '../utils/jwt.util';
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

    req.user = await authenticateToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

// Shared with the MCP stdio entry, so both accept exactly the same tokens.
export async function authenticateToken(token: string): Promise<TokenPayload> {
  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw error;
  }

  // A deleted user, or a token issued before a password change, is no
  // longer a valid session (ADR 0002).
  const tokenVersion = await users.findTokenVersion(payload.id);
  if (tokenVersion === null || tokenVersion !== payload.ver) {
    throw new AppError(401, 'Invalid token');
  }

  return payload;
}
