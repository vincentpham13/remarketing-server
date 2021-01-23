export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  roleId?: number;
  token?: string;
}
