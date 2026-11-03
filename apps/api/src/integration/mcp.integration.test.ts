import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { today } from '@repo/core';
import request from 'supertest';

import { app } from '../app';
import { tokenFromSetCookie } from '../utils/session-cookie';
import { disconnectDatabase, resetDatabase } from './db';
import { registerUser } from './register';

let server: Server;
let mcpUrl: URL;
const clients: Client[] = [];

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  mcpUrl = new URL(`http://127.0.0.1:${port}/api/mcp`);
});

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await Promise.all(clients.map((client) => client.close()));
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await disconnectDatabase();
});

async function connect(token: string) {
  const client = new Client({ name: 'integration-test', version: '1.0.0' });
  clients.push(client);
  await client.connect(
    new StreamableHTTPClientTransport(mcpUrl, {
      requestInit: { headers: { Authorization: `Bearer ${token}` } },
    }),
  );
  return client;
}

async function callTool(
  client: Client,
  name: string,
  args: Record<string, unknown> = {},
) {
  const result = (await client.callTool({
    name,
    arguments: args,
  })) as CallToolResult;
  const text = result.content[0]?.type === 'text' ? result.content[0].text : '';
  return { result, text, data: result.isError ? undefined : JSON.parse(text) };
}

async function createHabit(token: string, name: string) {
  const response = await request(app)
    .post('/api/habits')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, color: 'green' });
  return response.body.id as string;
}

async function registerSecondUser() {
  const response = await request(app).post('/api/auth/register').send({
    email: 'grace@example.com',
    password: 'long-enough',
    name: 'Grace',
  });
  return tokenFromSetCookie(response.headers['set-cookie']);
}

describe('MCP over Streamable HTTP', () => {
  it('lists tools and logs a habit that the REST API then shows', async () => {
    const { token } = await registerUser();
    const habitId = await createHabit(token, 'Run');
    const client = await connect(token);

    expect(client.getServerVersion()?.name).toBe('habits-plus');
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(6);

    const { data } = await callTool(client, 'log_habit', { habitId });
    expect(data).toEqual(
      expect.objectContaining({
        status: 'logged',
        date: today(),
        currentStreak: 1,
      }),
    );

    const completions = await request(app)
      .get('/api/completions')
      .set('Authorization', `Bearer ${token}`);
    expect(completions.body).toEqual([
      expect.objectContaining({
        habitId,
        completedAt: `${today()}T00:00:00.000Z`,
      }),
    ]);

    const again = await callTool(client, 'log_habit', { habitId });
    expect(again.data.status).toBe('already_logged');

    const undo = await callTool(client, 'unlog_habit', { habitId });
    expect(undo.data.status).toBe('removed');
  });

  it('keeps each user to their own habits', async () => {
    const { token } = await registerUser();
    const habitId = await createHabit(token, 'Run');
    const other = await connect(await registerSecondUser());

    const listed = await callTool(other, 'list_habits');
    expect(listed.data.habits).toEqual([]);

    const logged = await callTool(other, 'log_habit', { habitId });
    expect(logged.result.isError).toBe(true);
    expect(logged.text).toBe('Habit not found');
  });

  it('reads the today resource over HTTP', async () => {
    const { token } = await registerUser();
    await createHabit(token, 'Read');
    const client = await connect(token);

    const { contents } = await client.readResource({ uri: 'habits://today' });
    expect(JSON.parse(String(contents[0].text))).toEqual({
      date: today(),
      habits: [expect.objectContaining({ name: 'Read', done: false })],
    });
  });

  it('requires a Bearer token and sends a WWW-Authenticate challenge', async () => {
    const response = await request(app)
      .post('/api/mcp')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

    expect(response.status).toBe(401);
    expect(response.headers['www-authenticate']).toMatch(
      /^Bearer resource_metadata="http.+\/\.well-known\/oauth-protected-resource\/api\/mcp"$/,
    );
  });

  it('refuses the session cookie', async () => {
    const { response: registered } = await registerUser();

    const response = await request(app)
      .post('/api/mcp')
      .set('Cookie', registered.headers['set-cookie'])
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

    expect(response.status).toBe(401);
  });

  it('rejects an invalid token with a challenge', async () => {
    const response = await request(app)
      .post('/api/mcp')
      .set('Authorization', 'Bearer not-a-token')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

    expect(response.status).toBe(401);
    expect(response.headers['www-authenticate']).toContain('Bearer');
  });

  it('rejects requests from a foreign browser origin', async () => {
    const { token } = await registerUser();

    const response = await request(app)
      .post('/api/mcp')
      .set('Authorization', `Bearer ${token}`)
      .set('Origin', 'https://evil.example')
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

    expect(response.status).toBe(403);
  });

  it('answers GET and DELETE with 405 in stateless mode', async () => {
    const { token } = await registerUser();

    for (const method of ['get', 'delete'] as const) {
      const response = await request(app)
        [method]('/api/mcp')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(405);
      expect(response.headers.allow).toBe('POST');
    }
  });
});
