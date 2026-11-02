import { describe, expect, it, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';

import { AppError, errorMiddleware } from './error.middleware';

function send(error: Error) {
  const json = jest.fn();
  const res = {
    status: jest.fn(() => res),
    json,
  } as unknown as Response;

  errorMiddleware(error, {} as Request, res, jest.fn() as NextFunction);

  return {
    status: (res.status as jest.Mock).mock.calls[0][0],
    body: json.mock.calls[0][0],
  };
}

describe('errorMiddleware', () => {
  it('sends the error code so clients do not match on the English message', () => {
    const { status, body } = send(
      new AppError(
        400,
        'Current password is incorrect',
        'CURRENT_PASSWORD_INCORRECT',
      ),
    );

    expect(status).toBe(400);
    expect(body).toEqual({
      status: 'error',
      message: 'Current password is incorrect',
      code: 'CURRENT_PASSWORD_INCORRECT',
    });
  });

  it('leaves the code out when the error has none', () => {
    const { body } = send(new AppError(404, 'Goal not found'));

    expect(body).toEqual({ status: 'error', message: 'Goal not found' });
  });
});
