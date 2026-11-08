import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { addDays } from '@repo/core';
import request from 'supertest';

import { app } from '../app';
import { prisma } from '../config/database';
import { disconnectDatabase, resetDatabase } from './db';
import { registerUser } from './register';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

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
      .send({ habitId, date: utcToday() });

    expect(on.status).toBe(200);
    expect(on.body.completed).toBe(true);
    expect(on.body.completion.habitId).toBe(habitId);

    const off = await request(app)
      .post('/api/completions/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId, date: utcToday() });

    expect(off.status).toBe(200);
    expect(off.body).toEqual({ completed: false, completion: null });
  });

  it('logs a past day after the habit was created and rejects other days', async () => {
    const { token } = await registerUser();
    const created = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read', color: 'sky' });
    const habitId = created.body.id as string;
    const today = utcToday();
    await prisma.habit.update({
      where: { id: habitId },
      data: { createdAt: new Date(`${addDays(today, -5)}T08:00:00Z`) },
    });

    const toggle = (date: string) =>
      request(app)
        .post('/api/completions/toggle')
        .set('Authorization', `Bearer ${token}`)
        .send({ habitId, date });

    const past = await toggle(addDays(today, -3));
    expect(past.status).toBe(200);
    expect(past.body.completed).toBe(true);

    expect((await toggle(addDays(today, -6))).status).toBe(400);
    expect((await toggle(addDays(today, 2))).status).toBe(400);

    await request(app)
      .patch(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ archived: true });
    expect((await toggle(addDays(today, -2))).status).toBe(409);

    // Undo still works on an archived habit.
    const undo = await toggle(addDays(today, -3));
    expect(undo.body).toEqual({ completed: false, completion: null });
  });

  it('keeps completions when a habit is archived and deletes it only from the archive', async () => {
    const { token } = await registerUser();
    const created = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Read', color: 'sky' });
    const habitId = created.body.id as string;

    await request(app)
      .post('/api/completions/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId, date: utcToday() });

    const active = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(active.status).toBe(409);

    const archived = await request(app)
      .patch(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ archived: true });

    expect(archived.status).toBe(200);
    expect(archived.body.archivedAt).toEqual(expect.any(String));

    const completions = await request(app)
      .get('/api/completions')
      .set('Authorization', `Bearer ${token}`);

    expect(completions.body).toEqual([expect.objectContaining({ habitId })]);

    const restored = await request(app)
      .patch(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ archived: false });

    expect(restored.body.archivedAt).toBeNull();

    await request(app)
      .patch(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ archived: true });

    const removed = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removed.status).toBe(204);
  });

  it('rejects a completion for a habit the user does not own', async () => {
    const { token } = await registerUser();

    const toggle = await request(app)
      .post('/api/completions/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ habitId: 'missing-habit', date: utcToday() });

    expect(toggle.status).toBe(404);
  });

  it('rejects habit creation without a token', async () => {
    const created = await request(app)
      .post('/api/habits')
      .send({ name: 'Read', color: 'sky' });

    expect(created.status).toBe(401);
  });
});
