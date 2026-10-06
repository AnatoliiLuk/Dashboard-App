import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { app } from '../app';
import { disconnectDatabase, resetDatabase } from './db';
import { registerUser } from './register';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe('habits and completions', () => {
  it('creates a habit and lists it for that user', async () => {
    const { token } = await registerUser();

    const created = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read', color: 'sky' });

    expect(created.status).toBe(201);

    const listed = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`);

    expect(listed.status).toBe(200);
    expect(listed.body).toEqual([
      expect.objectContaining({
        id: created.body.id,
        name: 'Read',
        color: 'sky',
      }),
    ]);
  });

  it('toggles a completion on and then off', async () => {
    const { token } = await registerUser();
    const created = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read', color: 'sky' });
    const habitId = created.body.id as string;

    const on = await request(app)
      .post('/api/completions/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId, date: '2026-10-06' });

    expect(on.status).toBe(200);
    expect(on.body.completed).toBe(true);
    expect(on.body.completion.habitId).toBe(habitId);

    const off = await request(app)
      .post('/api/completions/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId, date: '2026-10-06' });

    expect(off.status).toBe(200);
    expect(off.body).toEqual({ completed: false, completion: null });
  });

  it('rejects a completion for a habit the user does not own', async () => {
    const { token } = await registerUser();

    const toggle = await request(app)
      .post('/api/completions/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId: 'missing-habit', date: '2026-10-06' });

    expect(toggle.status).toBe(404);
  });

  it('rejects habit creation without a token', async () => {
    const created = await request(app)
      .post('/api/habits')
      .send({ name: 'Read', color: 'sky' });

    expect(created.status).toBe(401);
  });
});
