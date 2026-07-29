import { IAuthUser, IUserReader } from '../repositories/user.repository.interface';
import { IRoleEvaluator } from './role-evaluator.interface';

export class DefaultRoleEvaluator implements IRoleEvaluator {
  async isSuperAdmin(user: IAuthUser, dbClient: IUserReader): Promise<boolean> {
    if (!user) return false;

    // 1. Check globally assigned role first
    if (user.role && ['SUPER_ADMIN', 'SUPERADMIN', 'OWNER'].includes(String(user.role).toUpperCase().trim())) {
      return true;
    }

    // 2. Check if the user has a SUPER_ADMIN membership in any workspace
    return dbClient.checkSuperAdminMembership(user.id);
  }
}
