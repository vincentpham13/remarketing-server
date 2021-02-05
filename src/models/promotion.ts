export interface Promotion {
  id?: number;
  code: string;
  description?: string;
  quantity: number;
  validPackages?: number[];
  monthDuration: number;
  messageAmount: number;
  validPrice?: number;
  canUseWithOther: boolean;
  validTo: Date;
  createdAt?: Date;
  updatedAt?: Date;

}

export interface OrderPromotion {
  orderId: number;
  promotionId: number;
  appliedAt?: Date;
}

export interface InvalidPromotion {
  promotionCode: string;
  inValidType: string;
}

export interface PromotionUpdate {
  id: number;
  [key: string]: string | number | Date;
}
