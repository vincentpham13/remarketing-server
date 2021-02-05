import { Package } from "./package";

export interface Order {
  id: number;
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
  promotionIds?: number[];
}

export interface OrderCreate {
  userId: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  businessName?: string;
  businessAddress?: string;
  emailReceipt?: string;
  taxId?: string;
}

export interface OrderUpdate {
  id: number;
  [key: string]: string | number | Date;
}

export interface OrderPackage {
  orderId: number;
  packageId: number;
}