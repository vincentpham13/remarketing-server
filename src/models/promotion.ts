export interface Promotion {
  id?: number;
  code: string;
  description?: string;
  quantity: number;
  validPackageIds?: number[];
  monthDuration: number;
  messageAmount: number;
  validPrice?: number;
  canUseWithOther: boolean;
  validTo: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export function instanceOfPromotion(data: any): data is Promotion { 
  return 'id' in data &&  'code' in data; 
} 
export interface OrderPromotion {
  orderId: number;
  promotionId: number;
  monthDuration?: number;
  messageAmount?: number;
  appliedAt?: Date;
}
export interface InvalidPromotion {
  promotionCode: string;
  error: {
    message: string,
    code: number
  }
}

export function instanceOfInvalidPromotion(data: any): data is InvalidPromotion { 
  return 'promotionCode' in data &&  'error' in data; 
} 
export interface PromotionUpdate {
  id: number;
  [key: string]: string | number | Date;
}
