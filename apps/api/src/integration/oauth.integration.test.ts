import { createHash, randomBytes } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

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
import request from 'supertest';

import { app } from '../app';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { OAuthRepository } from '../repositories/oauth.repository';
import { disconnectDatabase, resetDatabase } from './db';
import { registerUser } from './register';
import { tokenFromSetCookie } from '../utils/session-cookie';

// The whole flow an MCP client such as Claude.ai runs (ADR 0004):
// discovery -> registration -> authorize -> consent -> token -> /api/mcp.

const REDIRECT_URI = 'http://127.0.0.1:9999/callback';
const RESOURCE = new URL('/api/mcp', env.API_PUBLIC_URL).href;

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

function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

async function registerClient() {
  const response = await request(app)
    .post('/register')
    .send({
      client_name: 'Test client',
      redirect_uris: [REDIRECT_URI],
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    });
  expect(response.status).toBe(201);
  return response.body.client_id as string;
}

async function authorize(
  clientId: string,
  challenge: string,
  extra: Record<string, string> = {},
) {
  return request(app)
    .get('/authorize')
    .query({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: 'state-123',
      resource: RESOURCE,
      ...extra,
    });
}

/** Signed-in person, consent request from /authorize, ready to decide. */
async function startFlow(scope?: string) {
  const { response: registered, token: sessionToken } = await registerUser();
  const cookie = registered.headers['set-cookie'];
  const clientId = await registerClient();
  const { verifier, challenge } = pkce();

  const authorized = await authorize(
    clientId,
    challenge,
    scope ? { scope } : {},
  );
  expect(authorized.status).toBe(302);
  const consentUrl = new URL(authorized.headers.location);
  expect(consentUrl.origin + consentUrl.pathname).toBe(
    new URL('/oauth/consent', env.WEB_URL).href,
  );

  return {
    cookie,
    sessionToken,
    clientId,
    verifier,
    consentRequest: consentUrl.searchParams.get('request')!,
  };
}

async function approve(cookie: string | string[], consentRequest: string) {
  const response = await request(app)
    .post('/api/oauth/consent')
    .set('Cookie', cookie)
    .send({ request: consentRequest, approve: true });
  expect(response.status).toBe(200);
  return new URL(response.body.redirectTo);
}

async function exchangeCode(clientId: string, code: string, verifier: string) {
  return request(app).post('/token').type('form').send({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    code_verifier: verifier,
    redirect_uri: REDIRECT_URI,
    resource: RESOURCE,
  });
}

/** Runs the flow to the end and returns the tokens. */
async function tokensFor(scope?: string) {
  const flow = await startFlow(scope);
  const redirect = await approve(flow.cookie, flow.consentRequest);
  const tokens = await exchangeCode(
    flow.clientId,
    redirect.searchParams.get('code')!,
    flow.verifier,
  );
  expect(tokens.status).toBe(200);
  return { ...flow, tokens: tokens.body };
}

async function mcpClient(accessToken: string) {
  const client = new Client({ name: 'oauth-test', version: '1.0.0' });
  clients.push(client);
  await client.connect(
    new StreamableHTTPClientTransport(mcpUrl, {
      requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
    }),
  );
  return client;
}

function mcpList(accessToken: string) {
  return request(app)
    .post('/api/mcp')
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Accept', 'application/json, text/event-stream')
    .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
}

describe('MCP OAuth discovery', () => {
  it('points from the MCP endpoint to the authorization server', async () => {
    const challenge = await request(app).post('/api/mcp').send({});
    expect(challenge.status).toBe(401);
    expect(challenge.headers['www-authenticate']).toBe(
      `Bearer resource_metadata="${new URL('/.well-known/oauth-protected-resource/api/mcp', env.API_PUBLIC_URL).href}"`,
    );

    const resource = await request(app).get(
      '/.well-known/oauth-protected-resource/api/mcp',
    );
    expect(resource.body).toEqual(
      expect.objectContaining({
        resource: RESOURCE,
        authorization_servers: [new URL(env.API_PUBLIC_URL).href],
        scopes_supported: ['habits:read', 'habits:write'],
      }),
    );

    const metadata = await request(app).get(
      '/.well-known/oauth-authorization-server',
    );
    expect(metadata.body).toEqual(
      expect.objectContaining({
        authorization_endpoint: expect.stringMatching(/\/authorize$/),
        token_endpoint: expect.stringMatching(/\/token$/),
        registration_endpoint: expect.stringMatching(/\/register$/),
        code_challenge_methods_supported: ['S256'],
      }),
    );
  });
});

describe('MCP OAuth flow', () => {
  it('issues scoped tokens that work on /api/mcp', async () => {
    const flow = await startFlow('habits:read');

    const consent = await request(app)
      .get('/api/oauth/consent')
      .query({ request: flow.consentRequest })
      .set('Cookie', flow.cookie);
    expect(consent.body).toEqual({
      clientName: 'Test client',
      clientUri: null,
      redirectHost: '127.0.0.1:9999',
      scopes: ['habits:read'],
    });

    const redirect = await approve(flow.cookie, flow.consentRequest);
    expect(redirect.origin + redirect.pathname).toBe(REDIRECT_URI);
    expect(redirect.searchParams.get('state')).toBe('state-123');
    expect(redirect.searchParams.get('iss')).toBe(
      new URL(env.API_PUBLIC_URL).href,
    );

    const tokens = await exchangeCode(
      flow.clientId,
      redirect.searchParams.get('code')!,
      flow.verifier,
    );
    expect(tokens.status).toBe(200);
    expect(tokens.body).toEqual({
      access_token: expect.stringMatching(/^hpat_/),
      refresh_token: expect.stringMatching(/^hprt_/),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'habits:read',
    });

    const client = await mcpClient(tokens.body.access_token);
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_habit_history',
      'list_goals',
      'list_habits',
    ]);
  });

  it('grants every scope when none is requested', async () => {
    const { tokens } = await tokensFor();

    expect(tokens.scope).toBe('habits:read habits:write');
    const client = await mcpClient(tokens.access_token);
    expect((await client.listTools()).tools).toHaveLength(6);
  });

  it('uses each authorization code once', async () => {
    const flow = await startFlow();
    const redirect = await approve(flow.cookie, flow.consentRequest);
    const code = redirect.searchParams.get('code')!;

    expect(
      (await exchangeCode(flow.clientId, code, flow.verifier)).status,
    ).toBe(200);
    const reused = await exchangeCode(flow.clientId, code, flow.verifier);
    expect(reused.status).toBe(400);
    expect(reused.body.error).toBe('invalid_grant');
  });

  it('rejects a wrong PKCE verifier', async () => {
    const flow = await startFlow();
    const redirect = await approve(flow.cookie, flow.consentRequest);

    const response = await exchangeCode(
      flow.clientId,
      redirect.searchParams.get('code')!,
      pkce().verifier,
    );
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid_grant');
  });

  it('sends access_denied when the person declines', async () => {
    const flow = await startFlow();

    const response = await request(app)
      .post('/api/oauth/consent')
      .set('Cookie', flow.cookie)
      .send({ request: flow.consentRequest, approve: false });

    const redirect = new URL(response.body.redirectTo);
    expect(redirect.searchParams.get('error')).toBe('access_denied');
    expect(redirect.searchParams.get('code')).toBeNull();
    expect(redirect.searchParams.get('state')).toBe('state-123');
  });

  it('rotates refresh tokens and rejects a used one', async () => {
    const { clientId, tokens } = await tokensFor();
    const refresh = (refreshToken: string) =>
      request(app).post('/token').type('form').send({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
      });

    const rotated = await refresh(tokens.refresh_token);
    expect(rotated.status).toBe(200);
    expect(rotated.body.refresh_token).not.toBe(tokens.refresh_token);
    expect((await mcpList(rotated.body.access_token)).status).toBe(200);

    const reused = await refresh(tokens.refresh_token);
    expect(reused.status).toBe(400);
    expect(reused.body.error).toBe('invalid_grant');
  });

  it('ends the grant when the refresh token is revoked', async () => {
    const { clientId, tokens } = await tokensFor();

    const revoked = await request(app).post('/revoke').type('form').send({
      client_id: clientId,
      token: tokens.refresh_token,
    });
    expect(revoked.status).toBe(200);

    const response = await mcpList(tokens.access_token);
    expect(response.status).toBe(401);
    expect(response.headers['www-authenticate']).toContain(
      'error="invalid_token"',
    );
  });

  it('ends OAuth grants when the password changes (ADR 0002)', async () => {
    const { sessionToken, tokens } = await tokensFor();
    expect((await mcpList(tokens.access_token)).status).toBe(200);

    const changed = await request(app)
      .post('/api/users/me/password')
      .set('Authorization', `Bearer ${sessionToken}`)
      .send({ currentPassword: 'long-enough', newPassword: 'even-longer-1' });
    expect(changed.status).toBe(200);

    expect((await mcpList(tokens.access_token)).status).toBe(401);
  });

  it('refuses a resource other than the MCP endpoint', async () => {
    const clientId = await registerClient();

    const response = await authorize(clientId, pkce().challenge, {
      resource: 'https://other.example/api',
    });

    expect(response.status).toBe(302);
    const redirect = new URL(response.headers.location);
    expect(redirect.origin + redirect.pathname).toBe(REDIRECT_URI);
    expect(redirect.searchParams.get('error')).toBe('invalid_target');
  });

  it('refuses unknown scopes', async () => {
    const clientId = await registerClient();

    const response = await authorize(clientId, pkce().challenge, {
      scope: 'habits:read admin',
    });

    const redirect = new URL(response.headers.location);
    expect(redirect.searchParams.get('error')).toBe('invalid_scope');
  });
});

describe('MCP OAuth consent API', () => {
  it('needs a signed-in person', async () => {
    const response = await request(app)
      .post('/api/oauth/consent')
      .send({ request: 'anything', approve: true });

    expect(response.status).toBe(401);
  });

  it('rejects an edited consent request', async () => {
    const flow = await startFlow();
    const [header, payload, signature] = flow.consentRequest.split('.');
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const edited = Buffer.from(
      JSON.stringify({ ...claims, redirectUri: 'https://evil.example/cb' }),
    ).toString('base64url');

    const response = await request(app)
      .post('/api/oauth/consent')
      .set('Cookie', flow.cookie)
      .send({ request: `${header}.${edited}.${signature}`, approve: true });

    expect(response.status).toBe(400);
  });
});

describe('Connected apps API', () => {
  const listGrants = (sessionToken: string) =>
    request(app)
      .get('/api/oauth/grants')
      .set('Authorization', `Bearer ${sessionToken}`);

  const revokeGrant = (sessionToken: string, clientId: string) =>
    request(app)
      .delete(`/api/oauth/grants/${clientId}`)
      .set('Authorization', `Bearer ${sessionToken}`);

  it('lists each connected app once with its scopes', async () => {
    const { sessionToken, clientId, tokens } = await tokensFor('habits:read');
    // A refresh adds tokens but not a second row.
    await request(app).post('/token').type('form').send({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: tokens.refresh_token,
    });

    const response = await listGrants(sessionToken);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        clientId,
        clientName: 'Test client',
        clientUri: null,
        scopes: ['habits:read'],
        lastUsedAt: expect.any(String),
      },
    ]);
  });

  it('needs a signed-in person', async () => {
    expect((await request(app).get('/api/oauth/grants')).status).toBe(401);
  });

  it('disconnects an app: its tokens stop working at once', async () => {
    const { sessionToken, clientId, tokens } = await tokensFor();

    expect((await revokeGrant(sessionToken, clientId)).status).toBe(204);

    expect((await mcpList(tokens.access_token)).status).toBe(401);
    const refreshed = await request(app).post('/token').type('form').send({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: tokens.refresh_token,
    });
    expect(refreshed.body.error).toBe('invalid_grant');
    expect((await listGrants(sessionToken)).body).toEqual([]);
    expect((await revokeGrant(sessionToken, clientId)).status).toBe(404);
  });

  it("answers 404 for another person's app and leaves it connected", async () => {
    const { clientId, tokens } = await tokensFor();
    const other = await request(app).post('/api/auth/register').send({
      email: 'grace@example.com',
      password: 'long-enough',
      name: 'Grace',
    });
    const otherToken = tokenFromSetCookie(other.headers['set-cookie']);

    expect((await listGrants(otherToken)).body).toEqual([]);
    expect((await revokeGrant(otherToken, clientId)).status).toBe(404);
    expect((await mcpList(tokens.access_token)).status).toBe(200);
  });

  it('leaves out grants ended by a password change', async () => {
    const { sessionToken } = await tokensFor();

    const changed = await request(app)
      .post('/api/users/me/password')
      .set('Authorization', `Bearer ${sessionToken}`)
      .send({ currentPassword: 'long-enough', newPassword: 'even-longer-1' });

    expect((await listGrants(changed.body.token)).body).toEqual([]);
  });
});

describe('OAuth purge', () => {
  it('deletes expired codes and tokens and keeps live ones', async () => {
    const flow = await startFlow();
    const redirect = await approve(flow.cookie, flow.consentRequest);
    // A second approval leaves a code that is never exchanged.
    await approve(flow.cookie, flow.consentRequest);
    const { body: tokens } = await exchangeCode(
      flow.clientId,
      redirect.searchParams.get('code')!,
      flow.verifier,
    );
    const past = new Date(Date.now() - 1000);
    await prisma.oAuthToken.updateMany({
      where: { type: 'access' },
      data: { expiresAt: past },
    });
    await prisma.oAuthAuthorizationCode.updateMany({
      data: { expiresAt: past },
    });

    const deleted = await new OAuthRepository().deleteExpired(new Date());

    expect(deleted).toEqual({ codes: 1, tokens: 1 });
    expect(await prisma.oAuthToken.count({ where: { type: 'refresh' } })).toBe(
      1,
    );
    expect((await mcpList(tokens.access_token)).status).toBe(401);
  });
});
