import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
    return;
  }

  console.error('Unexpected error:', error);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
}
