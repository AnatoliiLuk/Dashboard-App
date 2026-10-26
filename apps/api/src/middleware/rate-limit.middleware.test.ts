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
    });
  });

  it('counts each user separately', async () => {
    const app = appWithLimit(1);

    await request(app).post('/chat').set('x-user', 'a').expect(200);
    await request(app).post('/chat').set('x-user', 'b').expect(200);
    await request(app).post('/chat').set('x-user', 'a').expect(429);
  });
});
