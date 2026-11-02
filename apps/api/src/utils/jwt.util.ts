import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

export type TokenPayload = {
  id: string;
  /** `User.tokenVersion` when the token was issued (ADR 0002). */
  ver: number;
};

export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as Partial<TokenPayload>;

  if (typeof decoded.id !== 'string') {
    throw new jwt.JsonWebTokenError('Token has no user id');
  }

  // Tokens issued before token versions existed have no `ver`; treat them as
  // version 0 so the deploy signs nobody out.
  return { id: decoded.id, ver: decoded.ver ?? 0 };
}
