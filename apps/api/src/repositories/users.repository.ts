import { prisma } from '../config/database';

export class UsersRepository {
  async findTokenVersion(id: string): Promise<number | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { tokenVersion: true },
    });

    return user?.tokenVersion ?? null;
  }
}
