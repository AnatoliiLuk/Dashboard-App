import { prisma } from '../config/database';

export type ProfileRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

export type AccountRecord = ProfileRecord & {
  passwordHash: string;
};

const profileFields = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

/** What `UsersService` needs, so tests can pass a fake. */
export type UsersStore = Pick<
  UsersRepository,
  | 'findTokenVersion'
  | 'findAccount'
  | 'findIdByEmail'
  | 'updateProfile'
  | 'updatePassword'
>;

export class UsersRepository {
  async findTokenVersion(id: string): Promise<number | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { tokenVersion: true },
    });

    return user?.tokenVersion ?? null;
  }

  async findAccount(id: string): Promise<AccountRecord | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { ...profileFields, passwordHash: true },
    });
  }

  /** `email` must already be normalized (trimmed, lowercased). */
  async findIdByEmail(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user?.id ?? null;
  }

  async updateProfile(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<ProfileRecord> {
    return prisma.user.update({
      where: { id },
      data,
      select: profileFields,
    });
  }

  /** Sets the new hash and signs out every session (ADR 0002). Returns the new token version. */
  async updatePassword(id: string, passwordHash: string): Promise<number> {
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });

    return user.tokenVersion;
  }
}
