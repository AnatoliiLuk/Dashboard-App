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

const range = {
  startDate: '2026-10-01',
  endDate: '2026-10-10',
};

describe('goals', () => {
  it('creates, lists, updates, and deletes a goal', async () => {
    const { token } = await registerUser();
    const habit = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read', color: 'sky' });
    const habitId = habit.body.id as string;

    const created = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'October focus',
        color: 'indigo',
        ...range,
        habitIds: [habitId],
      });

    expect(created.status).toBe(201);
    expect(created.body).toEqual(
      expect.objectContaining({
        name: 'October focus',
        color: 'indigo',
        startDate: '2026-10-01',
        endDate: '2026-10-10',
        habitIds: [habitId],
      }),
    );

    const listed = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${token}`);

    expect(listed.status).toBe(200);
    expect(listed.body).toEqual([
      expect.objectContaining({
        id: created.body.id,
        name: 'October focus',
      }),
    ]);

    const updated = await request(app)
      .patch(`/api/goals/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'November focus', color: 'crimson' });

    expect(updated.status).toBe(200);
    expect(updated.body).toEqual(
      expect.objectContaining({
        id: created.body.id,
        name: 'November focus',
        color: 'crimson',
        habitIds: [habitId],
      }),
    );

    const removed = await request(app)
      .delete(`/api/goals/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removed.status).toBe(204);

    const afterDelete = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${token}`);

    expect(afterDelete.status).toBe(200);
    expect(afterDelete.body).toEqual([]);
  });

  it('rejects goal requests without a token', async () => {
    const listed = await request(app).get('/api/goals');
    expect(listed.status).toBe(401);

    const created = await request(app)
      .post('/api/goals')
      .send({
        name: 'October focus',
        color: 'indigo',
        ...range,
        habitIds: ['habit-1'],
      });

    expect(created.status).toBe(401);
  });

  it('rejects a habit that belongs to another user', async () => {
    const { token } = await registerUser();
    const habit = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read', color: 'sky' });

    const other = await request(app).post('/api/auth/register').send({
      email: 'grace@example.com',
      password: 'long-enough',
      name: 'Grace',
    });

    const created = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${other.body.token}`)
      .send({
        name: 'October focus',
        color: 'indigo',
        ...range,
        habitIds: [habit.body.id],
      });

    expect(created.status).toBe(404);
    expect(created.body.message).toBe('Habit not found');

    const listed = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${other.body.token}`);

    expect(listed.status).toBe(200);
    expect(listed.body).toEqual([]);
  });
});
