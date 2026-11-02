import { Prisma } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import type {
  ProfileRecord,
  UsersStore,
} from '../repositories/users.repository';
import { comparePassword } from '../utils/password.util';
import type { UpdateProfileBody } from '../validators/users.validator';

export class UsersService {
  constructor(private store: UsersStore) {}

  async updateProfile(
    userId: string,
    input: UpdateProfileBody,
  ): Promise<ProfileRecord> {
    const account = await this.store.findAccount(userId);
    if (!account) {
      throw new AppError(401, 'User not found');
    }

    const { passwordHash, ...profile } = account;
    const changes: { name?: string; email?: string } = {};

    if (input.name !== undefined && input.name !== profile.name) {
      changes.name = input.name;
    }

    if (input.email !== undefined && input.email !== profile.email) {
      // Wrong password is 400, never 401: clients sign out on any 401.
      if (!input.currentPassword) {
        throw new AppError(400, 'Current password is required');
      }
      if (!(await comparePassword(input.currentPassword, passwordHash))) {
        throw new AppError(400, 'Current password is incorrect');
      }

      // Checked only after the password, so this can't probe for accounts.
      const owner = await this.store.findIdByEmail(input.email);
      if (owner && owner !== userId) {
        throw new AppError(409, 'Email already in use');
      }

      changes.email = input.email;
    }

    if (Object.keys(changes).length === 0) {
      return profile;
    }

    try {
      return await this.store.updateProfile(userId, changes);
    } catch (error) {
      // Another account took the email between the check and the write.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(409, 'Email already in use');
      }

      throw error;
    }
  }
}
