import { describe, expect, it, jest } from '@jest/globals';
import { Prisma } from '@prisma/client';

import { AppError } from '../middleware/error.middleware';
import type { UsersStore } from '../repositories/users.repository';
import { hashPassword } from '../utils/password.util';
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
