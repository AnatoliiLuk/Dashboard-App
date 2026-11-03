import { Prisma, type OAuthTokenType } from '@prisma/client';

import { prisma } from '../config/database';

export type OAuthClientRecord = {
  id: string;
  name: string | null;
  metadata: Prisma.JsonValue;
};

export type CreateCodeInput = {
  codeHash: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes: string[];
  resource: string;
  expiresAt: Date;
};

export type CreateTokenInput = {
  tokenHash: string;
  type: OAuthTokenType;
  clientId: string;
  userId: string;
  scopes: string[];
  resource: string;
  tokenVersion: number;
  expiresAt: Date;
};

/** One live token, joined with what its client registered. */
export type OAuthGrantTokenRecord = {
  clientId: string;
  clientName: string | null;
  clientUri: string | null;
  scopes: string[];
  createdAt: Date;
};

export class OAuthRepository {
  async findClient(id: string): Promise<OAuthClientRecord | null> {
    return prisma.oAuthClient.findUnique({
      where: { id },
      select: { id: true, name: true, metadata: true },
    });
  }

  async createClient(
    id: string,
    name: string | null,
    metadata: Prisma.InputJsonValue,
  ) {
    await prisma.oAuthClient.create({ data: { id, name, metadata } });
  }

  async createCode(data: CreateCodeInput) {
    await prisma.oAuthAuthorizationCode.create({ data });
  }

  async findCode(codeHash: string) {
    return prisma.oAuthAuthorizationCode.findUnique({ where: { codeHash } });
  }

  /** Deletes and returns the code, or null if another request used it first. */
  async consumeCode(codeHash: string) {
    try {
      return await prisma.oAuthAuthorizationCode.delete({
        where: { codeHash },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  async createTokens(tokens: CreateTokenInput[]) {
    await prisma.oAuthToken.createMany({ data: tokens });
  }

  async findToken(tokenHash: string, type: OAuthTokenType) {
    return prisma.oAuthToken.findFirst({
      where: { tokenHash, type },
      include: { user: { select: { tokenVersion: true } } },
    });
  }

  /** Deletes and returns the token, or null if it was already used. */
  async consumeToken(tokenHash: string, type: OAuthTokenType) {
    const deleted = await prisma.oAuthToken.deleteMany({
      where: { tokenHash, type },
    });
    return deleted.count > 0;
  }

  async deleteToken(tokenHash: string, clientId: string) {
    return prisma.oAuthToken.deleteMany({ where: { tokenHash, clientId } });
  }

  /** Unexpired tokens issued under the user's current `tokenVersion`. */
  async findLiveTokens(
    userId: string,
    tokenVersion: number,
    now: Date,
  ): Promise<OAuthGrantTokenRecord[]> {
    const rows = await prisma.oAuthToken.findMany({
      where: { userId, tokenVersion, expiresAt: { gt: now } },
      select: {
        clientId: true,
        scopes: true,
        createdAt: true,
        client: { select: { name: true, metadata: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      clientId: row.clientId,
      clientName: row.client.name,
      clientUri: clientUri(row.client.metadata),
      scopes: row.scopes,
      createdAt: row.createdAt,
    }));
  }

  /** Ends a grant: its tokens and any code not yet exchanged. Returns tokens deleted. */
  async deleteGrant(userId: string, clientId: string): Promise<number> {
    const [tokens] = await prisma.$transaction([
      prisma.oAuthToken.deleteMany({ where: { userId, clientId } }),
      prisma.oAuthAuthorizationCode.deleteMany({ where: { userId, clientId } }),
    ]);
    return tokens.count;
  }

  async deleteExpired(now: Date) {
    const [codes, tokens] = await prisma.$transaction([
      prisma.oAuthAuthorizationCode.deleteMany({
        where: { expiresAt: { lte: now } },
      }),
      prisma.oAuthToken.deleteMany({ where: { expiresAt: { lte: now } } }),
    ]);
    return { codes: codes.count, tokens: tokens.count };
  }
}

function clientUri(metadata: Prisma.JsonValue): string | null {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    const uri = metadata.client_uri;
    return typeof uri === 'string' ? uri : null;
  }
  return null;
}
