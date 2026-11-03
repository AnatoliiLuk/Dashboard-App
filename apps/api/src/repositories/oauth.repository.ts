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

  async deleteGrant(userId: string, clientId: string) {
    await prisma.oAuthToken.deleteMany({ where: { userId, clientId } });
  }
}
