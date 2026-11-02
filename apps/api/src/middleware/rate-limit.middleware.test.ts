import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';

import { errorMiddleware } from './error.middleware';
import { userRateLimit } from './rate-limit.middleware';

// A tiny app where the "auth" step reads the user id from a header.
function appWithLimit(limit: number) {
  const app = express();
  app.use((req, _res, next) => {
    req.user = { id: req.header('x-user') ?? 'anonymous' } as typeof req.user;
    next();
  });
  app.use(userRateLimit(limit));
  app.post('/chat', (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorMiddleware);
  return app;
}

describe('userRateLimit', () => {
  it('returns 429 after the limit, in the usual error format', async () => {
    const app = appWithLimit(2);

    await request(app).post('/chat').set('x-user', 'a').expect(200);
    await request(app).post('/chat').set('x-user', 'a').expect(200);
    const blocked = await request(app).post('/chat').set('x-user', 'a');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      status: 'error',
      message: 'Too many messages. Wait a minute and try again',
      code: 'RATE_LIMITED',
    });
  });

  it('with onlyFailures, ignores successes and uses the custom message', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.user = { id: 'a' } as typeof req.user;
      next();
    });
    app.use(userRateLimit(2, { onlyFailures: true, message: 'Slow down' }));
    app.post('/ok', (_req, res) => {
      res.json({ ok: true });
    });
    app.post('/bad', (_req, res) => {
      res.status(400).json({ status: 'error', message: 'nope' });
    });
    app.use(errorMiddleware);

    for (let i = 0; i < 5; i += 1) {
      await request(app).post('/ok').expect(200);
    }
    await request(app).post('/bad').expect(400);
    await request(app).post('/bad').expect(400);
    const blocked = await request(app).post('/bad');

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toBe('Slow down');
  });

  it('counts each user separately', async () => {
    const app = appWithLimit(1);

    await request(app).post('/chat').set('x-user', 'a').expect(200);
    await request(app).post('/chat').set('x-user', 'b').expect(200);
    await request(app).post('/chat').set('x-user', 'a').expect(429);
  });
});
