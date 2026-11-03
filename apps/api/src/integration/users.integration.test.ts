import { afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { app } from '../app';
import { prisma } from '../config/database';
import { tokenFromSetCookie } from '../utils/session-cookie';
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
    expect(updated.body.code).toBe('CURRENT_PASSWORD_REQUIRED');
  });

  it('rejects a wrong current password with 400, not 401, and keeps the email', async () => {
    const { token } = await registerUser();

    const updated = await updateMe(token, {
      email: 'countess@example.com',
      currentPassword: 'wrong-password',
    });

    expect(updated.status).toBe(400);
    expect(updated.body.message).toBe('Current password is incorrect');
    expect(updated.body.code).toBe('CURRENT_PASSWORD_INCORRECT');

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
    expect(updated.body.code).toBe('EMAIL_IN_USE');
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
    expect(blocked.body.code).toBe('RATE_LIMITED');
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

function changePassword(token: string, body: object) {
  return request(app)
    .post('/api/users/me/password')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

function listHabits(token: string) {
  return request(app)
    .get('/api/habits')
    .set('Authorization', `Bearer ${token}`);
}

describe('POST /api/users/me/password', () => {
  it('signs out other sessions and keeps this one with a new token', async () => {
    const { token: oldToken, password, email } = await registerUser();

    const changed = await changePassword(oldToken, {
      currentPassword: password,
      newPassword: 'brand-new-secret',
    });

    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({ token: expect.any(String) });
    expect(tokenFromSetCookie(changed.headers['set-cookie'])).toBe(
      changed.body.token,
    );

    expect((await listHabits(oldToken)).status).toBe(401);
    expect((await listHabits(changed.body.token)).status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'brand-new-secret' });
    expect(newLogin.status).toBe(200);
  });

  it('rejects a wrong current password with 400, not 401, and keeps the session', async () => {
    const { token } = await registerUser();

    const changed = await changePassword(token, {
      currentPassword: 'wrong-password',
      newPassword: 'brand-new-secret',
    });

    expect(changed.status).toBe(400);
    expect(changed.body.message).toBe('Current password is incorrect');
    expect(changed.body.code).toBe('CURRENT_PASSWORD_INCORRECT');
    expect((await listHabits(token)).status).toBe(200);
  });

  it('rejects a new password equal to the current one', async () => {
    const { token, password } = await registerUser();

    const changed = await changePassword(token, {
      currentPassword: password,
      newPassword: password,
    });

    expect(changed.status).toBe(400);
    expect(changed.body.message).toBe(
      'New password must differ from the current one',
    );
    expect(changed.body.code).toBe('PASSWORD_UNCHANGED');
  });

  it('rejects a new password shorter than 8 or longer than 128 characters', async () => {
    const { token, password } = await registerUser();

    const short = await changePassword(token, {
      currentPassword: password,
      newPassword: 'short',
    });
    const long = await changePassword(token, {
      currentPassword: password,
      newPassword: 'a'.repeat(129),
    });

    expect(short.status).toBe(400);
    expect(long.status).toBe(400);
  });

  it('returns 429 after 5 attempts in a minute', async () => {
    const { token } = await registerUser();
    const attempt = () =>
      changePassword(token, {
        currentPassword: 'wrong-password',
        newPassword: 'brand-new-secret',
      });

    for (let i = 0; i < 5; i += 1) {
      expect((await attempt()).status).toBe(400);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.code).toBe('RATE_LIMITED');
  });

  it('rejects a request without a token', async () => {
    const changed = await request(app)
      .post('/api/users/me/password')
      .send({ currentPassword: 'x', newPassword: 'brand-new-secret' });

    expect(changed.status).toBe(401);
  });
});

function deleteMe(token: string, body: object) {
  return request(app)
    .delete('/api/users/me')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

async function registerOther() {
  const response = await request(app).post('/api/auth/register').send({
    email: 'grace@example.com',
    password: 'long-enough',
    name: 'Grace',
  });
  return tokenFromSetCookie(response.headers['set-cookie']);
}

// One row in every table that hangs off a user.
async function seedEverything(email: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const habit = await prisma.habit.create({
    data: { userId: user.id, name: 'Read', color: 'sky' },
  });
  await prisma.completion.create({
    data: {
      userId: user.id,
      habitId: habit.id,
      completedAt: new Date('2026-10-01'),
    },
  });
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'October',
      color: 'indigo',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
      habits: { create: { habitId: habit.id } },
    },
  });
  await prisma.aiUsage.create({
    data: {
      userId: user.id,
      model: 'test-model',
      promptVersion: 'test',
      latencyMs: 1,
      status: 'ok',
    },
  });
  await prisma.coachConversation.create({
    data: {
      userId: user.id,
      messages: { create: { role: 'user', content: 'Hi' } },
    },
  });
}

async function rowCounts() {
  const [
    users,
    habits,
    completions,
    goals,
    goalHabits,
    aiUsage,
    conversations,
    messages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.habit.count(),
    prisma.completion.count(),
    prisma.goal.count(),
    prisma.goalHabit.count(),
    prisma.aiUsage.count(),
    prisma.coachConversation.count(),
    prisma.coachMessage.count(),
  ]);
  return {
    users,
    habits,
    completions,
    goals,
    goalHabits,
    aiUsage,
    conversations,
    messages,
  };
}

describe('DELETE /api/users/me', () => {
  it('deletes the user and all their data, and nobody else’s', async () => {
    const { token, password, email } = await registerUser();
    await registerOther();
    await seedEverything(email);
    await seedEverything('grace@example.com');

    const deleted = await deleteMe(token, { password });

    expect(deleted.status).toBe(204);
    expect(await rowCounts()).toEqual({
      users: 1,
      habits: 1,
      completions: 1,
      goals: 1,
      goalHabits: 1,
      aiUsage: 1,
      conversations: 1,
      messages: 1,
    });
    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
  });

  it('clears the session cookie and stops every token for the user', async () => {
    const { token, password, email } = await registerUser();
    const otherSession = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    const otherToken = tokenFromSetCookie(otherSession.headers['set-cookie']);

    const deleted = await deleteMe(token, { password });

    const cookie = String(deleted.headers['set-cookie']);
    expect(cookie).toMatch(/habits_plus_token=;/);
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect((await listHabits(token)).status).toBe(401);
    expect((await listHabits(otherToken)).status).toBe(401);
    expect(
      (await request(app).post('/api/auth/login').send({ email, password }))
        .status,
    ).toBe(401);
  });

  it('rejects a wrong password with 400, not 401, and keeps the account', async () => {
    const { token, email } = await registerUser();

    const deleted = await deleteMe(token, { password: 'wrong-password' });

    expect(deleted.status).toBe(400);
    expect(deleted.body.code).toBe('CURRENT_PASSWORD_INCORRECT');
    expect(await prisma.user.findUnique({ where: { email } })).not.toBeNull();
    expect((await listHabits(token)).status).toBe(200);
  });

  it('rejects a body without a password', async () => {
    const { token } = await registerUser();

    expect((await deleteMe(token, {})).status).toBe(400);
    expect(await prisma.user.count()).toBe(1);
  });

  it('returns 429 after 5 attempts in a minute', async () => {
    const { token } = await registerUser();
    const attempt = () => deleteMe(token, { password: 'wrong-password' });

    for (let i = 0; i < 5; i += 1) {
      expect((await attempt()).status).toBe(400);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.code).toBe('RATE_LIMITED');
  });

  it('rejects a request without a token', async () => {
    await registerUser();

    const deleted = await request(app)
      .delete('/api/users/me')
      .send({ password: 'long-enough' });

    expect(deleted.status).toBe(401);
    expect(await prisma.user.count()).toBe(1);
  });
});
