import { Package } from "./package";

export interface Order {
  id: string;
  userId: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  businessAddress?: string;
  emailReceipt?: string;
  taxId?: string;
  packages?: Package[];
}

export interface OrderCreate {
  userId: string;
  packageId: number;
  status: string;
}

export interface OrderUpdate {
  id: string;
  [key: string]: string | number | Date;
}