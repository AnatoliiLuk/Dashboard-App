import { Prisma } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import type {
  ProfileRecord,
  UsersStore,
} from '../repositories/users.repository';
import { comparePassword, hashPassword } from '../utils/password.util';
import type {
  ChangePasswordBody,
  DeleteAccountBody,
  UpdateProfileBody,
} from '../validators/users.validator';

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
        throw new AppError(
          400,
          'Current password is required',
          'CURRENT_PASSWORD_REQUIRED',
        );
      }
      if (!(await comparePassword(input.currentPassword, passwordHash))) {
        throw new AppError(
          400,
          'Current password is incorrect',
          'CURRENT_PASSWORD_INCORRECT',
        );
      }

      // Checked only after the password, so this can't probe for accounts.
      const owner = await this.store.findIdByEmail(input.email);
      if (owner && owner !== userId) {
        throw new AppError(409, 'Email already in use', 'EMAIL_IN_USE');
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
        throw new AppError(409, 'Email already in use', 'EMAIL_IN_USE');
      }

      throw error;
    }
  }

  /** Returns the new token version; the caller issues the new token. */
  async changePassword(
    userId: string,
    input: ChangePasswordBody,
  ): Promise<number> {
    const account = await this.store.findAccount(userId);
    if (!account) {
      throw new AppError(401, 'User not found');
    }

    // Wrong password is 400, never 401: clients sign out on any 401.
    if (!(await comparePassword(input.currentPassword, account.passwordHash))) {
      throw new AppError(
        400,
        'Current password is incorrect',
        'CURRENT_PASSWORD_INCORRECT',
      );
    }
    if (await comparePassword(input.newPassword, account.passwordHash)) {
      throw new AppError(
        400,
        'New password must differ from the current one',
        'PASSWORD_UNCHANGED',
      );
    }

    const passwordHash = await hashPassword(input.newPassword);
    return this.store.updatePassword(userId, passwordHash);
  }

  /** Deletes the user and all their data. There is no undo (ADR 0001). */
  async deleteAccount(userId: string, input: DeleteAccountBody): Promise<void> {
    const account = await this.store.findAccount(userId);
    if (!account) {
      throw new AppError(401, 'User not found');
    }

    // Wrong password is 400, never 401: clients sign out on any 401.
    if (!(await comparePassword(input.password, account.passwordHash))) {
      throw new AppError(
        400,
        'Current password is incorrect',
        'CURRENT_PASSWORD_INCORRECT',
      );
    }

    await this.store.deleteUser(userId);
  }
}
