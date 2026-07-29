import { prisma } from '@litetrace/db';
import { IAuthUser, IUserReader } from './user.repository.interface';

export class PrismaUserRepository implements IUserReader {
  async getUserByEmail(email: string): Promise<IAuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as IAuthUser | null;
  }

  async getUserById(id: string): Promise<IAuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as IAuthUser | null;
  }

  async checkSuperAdminMembership(userId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbClient = prisma as any;
    if (typeof dbClient.workspaceMember?.findFirst === 'function') {
      const superMembership = await dbClient.workspaceMember.findFirst({
        where: { userId, role: 'SUPER_ADMIN' },
        select: { id: true },
      });
      return !!superMembership;
    }
    return false;
  }
}
