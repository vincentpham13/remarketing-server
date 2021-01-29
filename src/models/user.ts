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

export interface UserPlan {
  userId: string;
  packageId: number;
  totalMessages: number;
  successMessages: number;
  validTo: Date;
}

export interface UserPlanUpdate {
  userId: string;
  [key: string]: string | number | Date;
}
export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  job?: string;
  roleId?: number;
  totalMessages: number;
  successMessages: number;
  validTo: Date;
}
