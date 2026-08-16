import { IAuthUser, IUserReader } from '../repositories/user.repository.interface';
import { IRoleEvaluator } from './role-evaluator.interface';

export class DefaultRoleEvaluator implements IRoleEvaluator {
  async isSuperAdmin(user: IAuthUser, dbClient: IUserReader): Promise<boolean> {
    if (!user || !user.id) return false;

    // Fast-fail: If the JWT doesn't even claim to be a superadmin, reject immediately.
    const rawRole = String(user.role).toUpperCase().trim();
    const isClaimingSuperAdmin = ['SUPER_ADMIN', 'SUPERADMIN', 'OWNER'].includes(rawRole);
    
    if (!isClaimingSuperAdmin) {
      return false;
    }

    
    
    // Strict Verification: Query the authoritative database.
    // This ensures that if a superadmin is demoted, their active JWT cannot be used.
    try {
      const isVerified = await dbClient.checkSuperAdminMembership(user.id);
      return isVerified;
    } catch (error) {
      // Fail secure: If the database cannot be reached, deny access.
      console.error(`Failed to verify superadmin status for ${user.id}`, error);
      return false;
    }
  }
}
