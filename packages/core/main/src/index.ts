import { PrismaUserRepository } from './repositories/user.repository';
import { DefaultRoleEvaluator } from './services/role-evaluator';
import { AuthUserService } from './services/auth-user.service';

export * from './repositories/user.repository.interface';
export * from './services/role-evaluator.interface';
export * from './services/auth-user.service';

const userRepository = new PrismaUserRepository();
const roleEvaluator = new DefaultRoleEvaluator();

export const authUserService = new AuthUserService(userRepository, roleEvaluator);
