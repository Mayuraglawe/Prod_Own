import { IAuthUser, IUserReader } from '../repositories/user.repository.interface';
import { IRoleEvaluator } from './role-evaluator.interface';

export class AuthUserService {
  constructor(
    private readonly userRepository: IUserReader,
    private readonly roleEvaluator: IRoleEvaluator,
  ) {}

  async getCurrentUser(email: string): Promise<IAuthUser | null> {
    return this.userRepository.getUserByEmail(email);
  }

  async getUserById(id: string): Promise<IAuthUser | null> {
    return this.userRepository.getUserById(id);
  }

  async isSuperAdmin(user: IAuthUser): Promise<boolean> {
    return this.roleEvaluator.isSuperAdmin(user, this.userRepository);
  }
}
