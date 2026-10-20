import request from 'supertest';

import { app } from '../app';
import { tokenFromSetCookie } from '../utils/session-cookie';

const email = 'ada@example.com';
const password = 'long-enough';

export async function registerUser() {
  const response = await request(app).post('/api/auth/register').send({
    email,
    password,
    name: 'Ada',
  });

  return {
    email,
    password,
    response,
    token: tokenFromSetCookie(response.headers['set-cookie']),
  };
}
