import type { TokenPayload } from '../utils/jwt.util';

export type { TokenPayload };

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
