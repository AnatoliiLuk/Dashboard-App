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

function updateMe(token: string, body: object) {
  return request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

describe('PATCH /api/users/me', () => {
  it('changes the name without a password and returns the profile', async () => {
    const { token } = await registerUser();

    const updated = await updateMe(token, { name: '  Ada Lovelace ' });

    expect(updated.status).toBe(200);
    expect(updated.body).toEqual({
      id: expect.any(String),
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      createdAt: expect.any(String),
    });

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.body.name).toBe('Ada Lovelace');
  });

  it('changes the email with the current password and keeps the session', async () => {
    const { token, password } = await registerUser();

    const updated = await updateMe(token, {
      email: 'Countess@Example.com',
      currentPassword: password,
    });

    expect(updated.status).toBe(200);
    expect(updated.body.email).toBe('countess@example.com');

    const habits = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`);
    expect(habits.status).toBe(200);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'countess@example.com', password });
    expect(login.status).toBe(200);
  });

  it('requires the current password to change the email', async () => {
    const { token } = await registerUser();

    const updated = await updateMe(token, { email: 'countess@example.com' });

    expect(updated.status).toBe(400);
    expect(updated.body.message).toBe('Current password is required');
  });

  it('rejects a wrong current password with 400, not 401, and keeps the email', async () => {
    const { token } = await registerUser();

    const updated = await updateMe(token, {
      email: 'countess@example.com',
      currentPassword: 'wrong-password',
    });

    expect(updated.status).toBe(400);
    expect(updated.body.message).toBe('Current password is incorrect');

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.body.email).toBe('ada@example.com');
  });

  it('treats the own email in another case as unchanged', async () => {
    const { token } = await registerUser();

    const updated = await updateMe(token, { email: 'ADA@example.com' });

    expect(updated.status).toBe(200);
    expect(updated.body.email).toBe('ada@example.com');
  });

  it('rejects an email used by another account, in any case, with 409', async () => {
    const { token, password } = await registerUser();
    await request(app).post('/api/auth/register').send({
      email: 'grace@example.com',
      password: 'long-enough',
      name: 'Grace',
    });

    const updated = await updateMe(token, {
      email: 'Grace@Example.com',
      currentPassword: password,
    });

    expect(updated.status).toBe(409);
    expect(updated.body.message).toBe('Email already in use');
  });

  it('only changes the signed-in account', async () => {
    const { token } = await registerUser();
    const other = await request(app).post('/api/auth/register').send({
      email: 'grace@example.com',
      password: 'long-enough',
      name: 'Grace',
    });

    await updateMe(token, { name: 'Ada Lovelace' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'grace@example.com', password: 'long-enough' });
    expect(login.body.user).toEqual(other.body.user);
  });

  it('returns 429 after 5 failed password attempts, but not for name edits', async () => {
    const { token, password } = await registerUser();

    for (let i = 0; i < 5; i += 1) {
      const wrong = await updateMe(token, {
        email: 'countess@example.com',
        currentPassword: 'wrong-password',
      });
      expect(wrong.status).toBe(400);
    }

    const blocked = await updateMe(token, {
      email: 'countess@example.com',
      currentPassword: password,
    });
    expect(blocked.status).toBe(429);
  });

  it('does not count successful name edits towards the limit', async () => {
    const { token } = await registerUser();

    for (let i = 0; i < 8; i += 1) {
      const updated = await updateMe(token, { name: `Ada ${i}` });
      expect(updated.status).toBe(200);
    }
  });

  it('rejects a body with neither name nor email', async () => {
    const { token } = await registerUser();

    const updated = await updateMe(token, {});

    expect(updated.status).toBe(400);
  });

  it('rejects a request without a token', async () => {
    const updated = await request(app)
      .patch('/api/users/me')
      .send({ name: 'Ada' });

    expect(updated.status).toBe(401);
  });
});
