import type { UserRole } from '../enums/user-role.enum';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
