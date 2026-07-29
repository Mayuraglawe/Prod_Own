import { IAuthUser, IUserReader } from '../repositories/user.repository.interface';

export interface IRoleEvaluator {
  isSuperAdmin(user: IAuthUser, dbClient: IUserReader): Promise<boolean>;
}
