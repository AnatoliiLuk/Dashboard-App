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

describe('auth', () => {
  it('registers a user and returns a token', async () => {
    const { response } = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: 'ada@example.com',
      name: 'Ada',
    });
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('rejects a duplicate email', async () => {
    await registerUser();

    const duplicate = await request(app).post('/api/auth/register').send({
      email: 'ada@example.com',
      password: 'long-enough',
      name: 'Ada',
    });

    expect(duplicate.status).toBe(400);
    expect(duplicate.body.message).toBe('Email already registered');
  });

  it('logs in with the registered password', async () => {
    const { email, password } = await registerUser();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
  });

  it('rejects a wrong password', async () => {
    const { email } = await registerUser();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' });

    expect(login.status).toBe(401);
  });

  it('returns the profile for a valid token', async () => {
    const { token } = await registerUser();

    const profile = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(profile.status).toBe(200);
    expect(profile.body).toMatchObject({
      email: 'ada@example.com',
      name: 'Ada',
    });
  });

  it('rejects a profile request without a token', async () => {
    const profile = await request(app).get('/api/auth/me');

    expect(profile.status).toBe(401);
  });
});
