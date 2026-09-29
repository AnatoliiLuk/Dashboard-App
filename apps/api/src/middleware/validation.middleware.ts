import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { AppError } from './error.middleware';

export function validateRequest(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((issue) => issue.message).join(', ');
        next(new AppError(400, messages));
        return;
      }

      next(error);
    }
  };
}
