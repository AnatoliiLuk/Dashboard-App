import { describe, expect, it, jest } from '@jest/globals';
import { Prisma } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import type { UsersStore } from '../repositories/users.repository';
import { comparePassword, hashPassword } from '../utils/password.util';
import { UsersService } from './users.service';

const createdAt = new Date('2026-10-01T09:00:00Z');

async function storeWith(overrides: Partial<UsersStore> = {}) {
  const passwordHash = await hashPassword('long-enough');
  const store: UsersStore = {
    findTokenVersion: jest.fn<UsersStore['findTokenVersion']>(),
    findAccount: jest.fn<UsersStore['findAccount']>().mockResolvedValue({
      id: 'user-a',
      email: 'ada@example.com',
      name: 'Ada',
      createdAt,
      passwordHash,
    }),
    findIdByEmail: jest
      .fn<UsersStore['findIdByEmail']>()
      .mockResolvedValue(null),
    updateProfile: jest.fn<UsersStore['updateProfile']>(),
    updatePassword: jest
      .fn<UsersStore['updatePassword']>()
      .mockResolvedValue(1),
    deleteUser: jest.fn<UsersStore['deleteUser']>().mockResolvedValue(),
    ...overrides,
  };
  return store;
}

describe('UsersService.updateProfile', () => {
  it('maps a unique-email race (P2002) to 409', async () => {
    const store = await storeWith({
      updateProfile: jest.fn<UsersStore['updateProfile']>().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      ),
    });
    const service = new UsersService(store);

    const result = service.updateProfile('user-a', {
      email: 'grace@example.com',
      currentPassword: 'long-enough',
    });

    await expect(result).rejects.toEqual(
      new AppError(409, 'Email already in use'),
    );
  });

  it('checks the password before revealing that an email is taken', async () => {
    const store = await storeWith({
      findIdByEmail: jest
        .fn<UsersStore['findIdByEmail']>()
        .mockResolvedValue('user-b'),
    });
    const service = new UsersService(store);

    const result = service.updateProfile('user-a', {
      email: 'grace@example.com',
      currentPassword: 'wrong-password',
    });

    await expect(result).rejects.toEqual(
      new AppError(400, 'Current password is incorrect'),
    );
    expect(store.findIdByEmail).not.toHaveBeenCalled();
  });

  it('does not write when nothing changed', async () => {
    const store = await storeWith();
    const service = new UsersService(store);

    const profile = await service.updateProfile('user-a', {
      name: 'Ada',
      email: 'ada@example.com',
    });

    expect(profile).toEqual({
      id: 'user-a',
      email: 'ada@example.com',
      name: 'Ada',
      createdAt,
    });
    expect(store.updateProfile).not.toHaveBeenCalled();
  });
});

describe('UsersService.changePassword', () => {
  it('stores a hash of the new password and returns the new token version', async () => {
    const store = await storeWith();
    const service = new UsersService(store);

    const version = await service.changePassword('user-a', {
      currentPassword: 'long-enough',
      newPassword: 'brand-new-secret',
    });

    expect(version).toBe(1);
    const [id, hash] = (store.updatePassword as jest.Mock).mock.calls[0] as [
      string,
      string,
    ];
    expect(id).toBe('user-a');
    expect(await comparePassword('brand-new-secret', hash)).toBe(true);
  });

  it('rejects a wrong current password without writing', async () => {
    const store = await storeWith();
    const service = new UsersService(store);

    const result = service.changePassword('user-a', {
      currentPassword: 'wrong-password',
      newPassword: 'brand-new-secret',
    });

    await expect(result).rejects.toEqual(
      new AppError(400, 'Current password is incorrect'),
    );
    expect(store.updatePassword).not.toHaveBeenCalled();
  });

  it('rejects a new password equal to the current one without writing', async () => {
    const store = await storeWith();
    const service = new UsersService(store);

    const result = service.changePassword('user-a', {
      currentPassword: 'long-enough',
      newPassword: 'long-enough',
    });

    await expect(result).rejects.toEqual(
      new AppError(400, 'New password must differ from the current one'),
    );
    expect(store.updatePassword).not.toHaveBeenCalled();
  });
});

describe('UsersService.deleteAccount', () => {
  it('deletes the user after checking the password', async () => {
    const store = await storeWith();
    const service = new UsersService(store);

    await service.deleteAccount('user-a', { password: 'long-enough' });

    expect(store.deleteUser).toHaveBeenCalledWith('user-a');
  });

  it('rejects a wrong password with 400 and keeps the account', async () => {
    const store = await storeWith();
    const service = new UsersService(store);

    const result = service.deleteAccount('user-a', {
      password: 'wrong-password',
    });

    await expect(result).rejects.toMatchObject({
      statusCode: 400,
      code: 'CURRENT_PASSWORD_INCORRECT',
    });
    expect(store.deleteUser).not.toHaveBeenCalled();
  });

  it('rejects a user who no longer exists with 401', async () => {
    const store = await storeWith({
      findAccount: jest.fn<UsersStore['findAccount']>().mockResolvedValue(null),
    });
    const service = new UsersService(store);

    const result = service.deleteAccount('user-a', { password: 'long-enough' });

    await expect(result).rejects.toMatchObject({ statusCode: 401 });
    expect(store.deleteUser).not.toHaveBeenCalled();
  });
});
