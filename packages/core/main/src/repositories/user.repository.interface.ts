export interface IAuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string | null;
  tenantId: string | null;
}

export interface IUserReader {
  getUserByEmail(email: string): Promise<IAuthUser | null>;
  getUserById(id: string): Promise<IAuthUser | null>;
  checkSuperAdminMembership(userId: string): Promise<boolean>;
}
