export interface Order {
  id: string;
  userId: string;
  packageId: number;
  status: string;
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