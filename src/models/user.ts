export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  job?: string;
  roleId?: number;
  token?: string;
}
