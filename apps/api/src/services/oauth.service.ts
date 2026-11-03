import { createHash, randomBytes } from 'node:crypto';

import type { OAuthRegisteredClientsStore } from '@modelcontextprotocol/sdk/server/auth/clients.js';
import {
  InvalidGrantError,
  InvalidScopeError,
  InvalidTargetError,
  InvalidTokenError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import type {
  AuthorizationParams,
  OAuthServerProvider,
} from '@modelcontextprotocol/sdk/server/auth/provider.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import type {
  OAuthClientInformationFull,
  OAuthTokenRevocationRequest,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import { checkResourceAllowed } from '@modelcontextprotocol/sdk/shared/auth-utils.js';
import type { Prisma } from '@prisma/client';
import type { OAuthConsentRequest, OAuthGrant, OAuthScope } from '@repo/types';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { authenticateToken } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { OAuthRepository } from '../repositories/oauth.repository';
import { UsersRepository } from '../repositories/users.repository';

export const MCP_SCOPES: readonly OAuthScope[] = [
  'habits:read',
  'habits:write',
];

export const OAUTH_ISSUER_URL = new URL(env.API_PUBLIC_URL);
export const MCP_RESOURCE_URL = new URL('/api/mcp', env.API_PUBLIC_URL);

const CODE_TTL_SECONDS = 10 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const CONSENT_AUDIENCE = 'habits-plus:oauth-consent';

// Prefixes make leaked tokens easy to spot in logs and secret scanners.
const ACCESS_PREFIX = 'hpat_';
const REFRESH_PREFIX = 'hprt_';

/** What /authorize hands to the consent page, signed so it cannot be edited. */
type ConsentClaims = {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes: OAuthScope[];
  state?: string;
  resource: string;
};

export type McpPrincipal = {
  userId: string;
  tokenVersion: number;
  scopes: OAuthScope[];
};

/**
 * The OAuth 2.1 authorization server behind the SDK's mcpAuthRouter
 * (ADR 0004). The router parses requests, authenticates clients and checks
 * PKCE; this class stores clients, codes and tokens and applies our rules.
 */
export class OAuthService implements OAuthServerProvider {
  private repository = new OAuthRepository();
  private users = new UsersRepository();

  get clientsStore(): OAuthRegisteredClientsStore {
    return {
      getClient: async (clientId) => {
        const row = await this.repository.findClient(clientId);
        return row
          ? (row.metadata as unknown as OAuthClientInformationFull)
          : undefined;
      },
      // The router has already validated the metadata and set client_id.
      registerClient: async (client) => {
        const full = client as OAuthClientInformationFull;
        await this.repository.createClient(
          full.client_id,
          full.client_name ?? null,
          full as unknown as Prisma.InputJsonValue,
        );
        return full;
      },
    };
  }

  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response,
  ): Promise<void> {
    const claims: ConsentClaims = {
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      scopes: resolveScopes(params.scopes ?? []),
      state: params.state,
      resource: resolveResource(params.resource),
    };
    const request = jwt.sign(claims, env.JWT_SECRET, {
      audience: CONSENT_AUDIENCE,
      expiresIn: CODE_TTL_SECONDS,
    });

    const consent = new URL('/oauth/consent', env.WEB_URL);
    consent.searchParams.set('request', request);
    res.redirect(consent.href);
  }

  /** What the consent page shows: who asks, for what, and where it returns. */
  async describeConsent(request: string): Promise<OAuthConsentRequest> {
    const claims = readConsentClaims(request);
    const client = await this.clientsStore.getClient(claims.clientId);
    if (!client) {
      throw new AppError(400, 'Authorization request is invalid or expired');
    }

    return {
      clientName: client.client_name ?? null,
      clientUri: client.client_uri ?? null,
      redirectHost: new URL(claims.redirectUri).host,
      scopes: claims.scopes,
    };
  }

  /** Returns the client redirect: with a code when approved, else access_denied. */
  async decideConsent(
    request: string,
    approve: boolean,
    userId: string,
  ): Promise<string> {
    const claims = readConsentClaims(request);
    const redirect = new URL(claims.redirectUri);

    if (approve) {
      const code = randomToken();
      await this.repository.createCode({
        codeHash: hashToken(code),
        clientId: claims.clientId,
        userId,
        redirectUri: claims.redirectUri,
        codeChallenge: claims.codeChallenge,
        scopes: claims.scopes,
        resource: claims.resource,
        expiresAt: secondsFromNow(CODE_TTL_SECONDS),
      });
      redirect.searchParams.set('code', code);
    } else {
      redirect.searchParams.set('error', 'access_denied');
      redirect.searchParams.set(
        'error_description',
        'The person declined access',
      );
    }

    if (claims.state) {
      redirect.searchParams.set('state', claims.state);
    }
    // RFC 9207: tells the client which server answered (mix-up protection).
    redirect.searchParams.set('iss', OAUTH_ISSUER_URL.href);
    return redirect.href;
  }

  async challengeForAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<string> {
    const code = await this.repository.findCode(hashToken(authorizationCode));
    if (!code || code.clientId !== client.client_id || isExpired(code)) {
      throw new InvalidGrantError('Invalid authorization code');
    }
    return code.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    _codeVerifier?: string,
    redirectUri?: string,
    resource?: URL,
  ): Promise<OAuthTokens> {
    // Deleting first makes the code single use even under concurrent requests.
    const code = await this.repository.consumeCode(
      hashToken(authorizationCode),
    );
    if (
      !code ||
      code.clientId !== client.client_id ||
      isExpired(code) ||
      (redirectUri !== undefined && redirectUri !== code.redirectUri)
    ) {
      throw new InvalidGrantError('Invalid authorization code');
    }
    if (resource && resolveResource(resource) !== code.resource) {
      throw new InvalidTargetError('Resource does not match the grant');
    }

    const tokenVersion = await this.users.findTokenVersion(code.userId);
    if (tokenVersion === null) {
      throw new InvalidGrantError('Invalid authorization code');
    }

    return this.issueTokens({
      clientId: code.clientId,
      userId: code.userId,
      scopes: code.scopes as OAuthScope[],
      resource: code.resource,
      tokenVersion,
    });
  }

  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[],
    resource?: URL,
  ): Promise<OAuthTokens> {
    const hash = hashToken(refreshToken);
    const token = await this.repository.findToken(hash, 'refresh');
    if (
      !token ||
      token.clientId !== client.client_id ||
      isExpired(token) ||
      token.tokenVersion !== token.user.tokenVersion
    ) {
      throw new InvalidGrantError('Invalid refresh token');
    }

    // A refresh may narrow the scopes, never widen them.
    const granted = token.scopes as OAuthScope[];
    const requested = scopes?.length ? resolveScopes(scopes) : granted;
    if (requested.some((scope) => !granted.includes(scope))) {
      throw new InvalidScopeError('Scope exceeds the original grant');
    }
    if (resource && resolveResource(resource) !== token.resource) {
      throw new InvalidTargetError('Resource does not match the grant');
    }

    // Rotation: the old refresh token works once.
    if (!(await this.repository.consumeToken(hash, 'refresh'))) {
      throw new InvalidGrantError('Invalid refresh token');
    }

    return this.issueTokens({
      clientId: token.clientId,
      userId: token.userId,
      scopes: requested,
      resource: token.resource,
      tokenVersion: token.tokenVersion,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<AuthInfo> {
    const token = await this.repository.findToken(
      hashToken(accessToken),
      'access',
    );
    if (
      !token ||
      isExpired(token) ||
      token.tokenVersion !== token.user.tokenVersion
    ) {
      throw new InvalidTokenError('Invalid access token');
    }

    return {
      token: accessToken,
      clientId: token.clientId,
      scopes: token.scopes,
      expiresAt: Math.floor(token.expiresAt.getTime() / 1000),
      resource: new URL(token.resource),
      extra: { userId: token.userId, tokenVersion: token.tokenVersion },
    };
  }

  async revokeToken(
    client: OAuthClientInformationFull,
    request: OAuthTokenRevocationRequest,
  ): Promise<void> {
    const hash = hashToken(request.token);

    // Revoking a refresh token ends the whole grant for that client.
    if (request.token.startsWith(REFRESH_PREFIX)) {
      const token = await this.repository.findToken(hash, 'refresh');
      if (token?.clientId === client.client_id) {
        await this.repository.deleteGrant(token.userId, token.clientId);
      }
      return;
    }

    // RFC 7009: unknown tokens are not an error.
    await this.repository.deleteToken(hash, client.client_id);
  }

  /** Apps that can still reach /api/mcp for the user, latest first. */
  async listGrants(userId: string): Promise<OAuthGrant[]> {
    const tokenVersion = await this.users.findTokenVersion(userId);
    if (tokenVersion === null) {
      return [];
    }

    const tokens = await this.repository.findLiveTokens(
      userId,
      tokenVersion,
      new Date(),
    );

    // Tokens come newest first, so the first one per client is its last use.
    const grants = new Map<string, OAuthGrant>();
    for (const token of tokens) {
      const grant = grants.get(token.clientId);
      if (grant) {
        grant.scopes = MCP_SCOPES.filter(
          (scope) =>
            grant.scopes.includes(scope) || token.scopes.includes(scope),
        );
        continue;
      }
      grants.set(token.clientId, {
        clientId: token.clientId,
        clientName: token.clientName,
        clientUri: token.clientUri,
        scopes: MCP_SCOPES.filter((scope) => token.scopes.includes(scope)),
        lastUsedAt: token.createdAt.toISOString(),
      });
    }
    return [...grants.values()];
  }

  /** Disconnects an app: its access and refresh tokens stop working at once. */
  async revokeGrant(userId: string, clientId: string): Promise<void> {
    const deleted = await this.repository.deleteGrant(userId, clientId);
    if (deleted === 0) {
      throw new AppError(404, 'Connected app not found');
    }
  }

  /**
   * Who is calling /api/mcp. OAuth access tokens carry their scopes; a
   * personal JWT (stdio, `claude mcp add --header`) gets every scope.
   */
  async authenticateMcpToken(token: string): Promise<McpPrincipal> {
    if (!token.startsWith(ACCESS_PREFIX)) {
      const payload = await authenticateToken(token);
      return {
        userId: payload.id,
        tokenVersion: payload.ver,
        scopes: [...MCP_SCOPES],
      };
    }

    let info: AuthInfo;
    try {
      info = await this.verifyAccessToken(token);
    } catch {
      throw new AppError(401, 'Invalid token');
    }
    if (info.resource?.href !== MCP_RESOURCE_URL.href) {
      throw new AppError(401, 'Token is for another resource');
    }

    const extra = info.extra as { userId: string; tokenVersion: number };
    return {
      userId: extra.userId,
      tokenVersion: extra.tokenVersion,
      scopes: info.scopes as OAuthScope[],
    };
  }

  private async issueTokens(grant: {
    clientId: string;
    userId: string;
    scopes: OAuthScope[];
    resource: string;
    tokenVersion: number;
  }): Promise<OAuthTokens> {
    const accessToken = randomToken(ACCESS_PREFIX);
    const refreshToken = randomToken(REFRESH_PREFIX);

    await this.repository.createTokens([
      {
        ...grant,
        tokenHash: hashToken(accessToken),
        type: 'access',
        expiresAt: secondsFromNow(ACCESS_TOKEN_TTL_SECONDS),
      },
      {
        ...grant,
        tokenHash: hashToken(refreshToken),
        type: 'refresh',
        expiresAt: secondsFromNow(REFRESH_TOKEN_TTL_SECONDS),
      },
    ]);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      refresh_token: refreshToken,
      scope: grant.scopes.join(' '),
    };
  }
}

/** No scope requested means every scope; unknown scopes are an error. */
function resolveScopes(requested: string[]): OAuthScope[] {
  const scopes = requested.filter(Boolean);
  if (scopes.length === 0) {
    return [...MCP_SCOPES];
  }

  const unknown = scopes.find(
    (scope) => !MCP_SCOPES.includes(scope as OAuthScope),
  );
  if (unknown) {
    throw new InvalidScopeError(`Unknown scope: ${unknown}`);
  }
  return MCP_SCOPES.filter((scope) => scopes.includes(scope));
}

/** RFC 8707: tokens are only for the MCP endpoint. */
function resolveResource(resource: URL | undefined): string {
  if (
    resource &&
    !checkResourceAllowed({
      requestedResource: resource,
      configuredResource: MCP_RESOURCE_URL,
    })
  ) {
    throw new InvalidTargetError(`Unknown resource: ${resource.href}`);
  }
  return MCP_RESOURCE_URL.href;
}

function readConsentClaims(request: string): ConsentClaims {
  try {
    return jwt.verify(request, env.JWT_SECRET, {
      audience: CONSENT_AUDIENCE,
    }) as ConsentClaims;
  } catch {
    throw new AppError(400, 'Authorization request is invalid or expired');
  }
}

function randomToken(prefix = ''): string {
  return `${prefix}${randomBytes(32).toString('base64url')}`;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function secondsFromNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

function isExpired({ expiresAt }: { expiresAt: Date }): boolean {
  return expiresAt.getTime() <= Date.now();
}
