import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { app } from '../app';
import { tokenFromSetCookie } from '../utils/session-cookie';
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
    expect(response.body.token).toBeUndefined();
    expect(tokenFromSetCookie(response.headers['set-cookie'])).toEqual(
      expect.any(String),
    );
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
    expect(login.body.token).toBeUndefined();
    expect(tokenFromSetCookie(login.headers['set-cookie'])).toEqual(
      expect.any(String),
    );
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

  it('accepts the session cookie and keeps it out of page scripts', async () => {
    const { response } = await registerUser();
    const setCookie = response.headers['set-cookie'];
    const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/SameSite=Lax/i);
    expect(header).not.toMatch(/Secure/i);

    const profile = await request(app)
      .get('/api/auth/me')
      .set('Cookie', (header ?? '').split(';')[0]);

    expect(profile.status).toBe(200);
    expect(profile.body).toMatchObject({ email: 'ada@example.com' });
  });

  it('clears the session cookie on logout', async () => {
    const loggedOut = await request(app).post('/api/auth/logout');
    const setCookie = loggedOut.headers['set-cookie'];
    const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    expect(loggedOut.status).toBe(204);
    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/Expires=Thu, 01 Jan 1970/i);
  });

  it('rejects a state change from an unknown origin', async () => {
    const rejected = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ email: 'ada@example.com', password: 'long-enough' });

    expect(rejected.status).toBe(403);
  });

  it('rejects a profile request without a token', async () => {
    const profile = await request(app).get('/api/auth/me');

    expect(profile.status).toBe(401);
  });
});
