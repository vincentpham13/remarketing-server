import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';


import { BadRequest } from '@/utils/http';
import { IPromotionRepo } from '../repositories/promotion';
import { InvalidPromotion, Promotion, PromotionUpdate } from '@/models/promotion';
import { InvalidPromotionType } from '@/enums/promotion';

export interface IPromotionService {
  getAllPromotion(rs: RequestScope): Promise<Promotion[]>;
  getPromotionById(rs: RequestScope, promotionId: number): Promise<Promotion>;
  getPromotionByCode(rs: RequestScope, promotionCode: string): Promise<Promotion>;
  createPromotion(rs: RequestScope, promotion: Promotion): Promise<Promotion>;
  updatePromotion(rs: RequestScope, promotion: PromotionUpdate): Promise<Promotion>;
  checkValidPromotions(promotion: Promotion, packageIds?: number[], orderPrice?: number): Promise<InvalidPromotion | boolean>;
}

@injectable()
export class PromotionService implements IPromotionService {
  @inject(TYPES.PromotionRepo)
  private promotionRepo: IPromotionRepo;

  async getAllPromotion(rs: RequestScope): Promise<Promotion[]> {
    try {
      const promotion = await this.promotionRepo.getAllPromotion(rs);
      return promotion;
    } catch (error) {
      throw error;
    }
  }

  async checkValidPromotions(promotion: Promotion, packageIds?: number[], orderPrice?: number): Promise<InvalidPromotion | boolean> {

    if (promotion.validTo > new Date()) {
      return {
        promotionCode: promotion.code,
        inValidType: InvalidPromotionType.EXPRIRED
      };
    }

    if (promotion.quantity <= 0) {
      return {
        promotionCode: promotion.code,
        inValidType: InvalidPromotionType.OUT_OF_STOCK
      };
    }

    if (promotion.validPackages && packageIds
      && !packageIds.every(packageId => promotion.validPackages?.includes(packageId))) {
      return {
        promotionCode: promotion.code,
        inValidType: InvalidPromotionType.OUT_OF_VALID_PACKAGES
      };
    }

    if (promotion.validPrice && orderPrice && promotion.validPrice > orderPrice) {
      return {
        promotionCode: promotion.code,
        inValidType: InvalidPromotionType.INVALID_PRICE
      };
    }
    return true;
    
  }


  async getPromotionById(rs: RequestScope, promotionId: number): Promise<Promotion> {
    try {
      const promotion = await this.promotionRepo.getPromotionById(rs, promotionId);
      return promotion;
    } catch (error) {
      throw error;
    }
  }

  async getPromotionByCode(rs: RequestScope, promotionCode: string): Promise<Promotion> {
    try {
      const promotion = await this.promotionRepo.getPromotionByCode(rs, promotionCode);
      return promotion;
    } catch (error) {
      throw error;
    }
  }

  async createPromotion(rs: RequestScope, promotion: Promotion): Promise<Promotion> {
    try {
      return rs.db.withTransaction<Promotion>(async () => {
        const existingPromotion = this.promotionRepo.getPromotionByCode(rs, promotion.code);
        if(existingPromotion){
          throw new BadRequest(null, "Promotion code already exist");
        }
        return await this.promotionRepo.createPromotion(rs, promotion);
      });
    } catch (error) {
      throw error;
    }
  }

  async updatePromotion(rs: RequestScope, promotion: PromotionUpdate): Promise<Promotion> {
    try {
      return rs.db.withTransaction<Promotion>(async () => {
        return await this.promotionRepo.updatePromotion(rs, promotion);
      });
    } catch (error) {
      throw error;
    }
  }

  async createOrderPromotion(rs: RequestScope, orderId: number, promotionId: number) {
    try {
      return rs.db.withTransaction<Promotion>(async () => {
        return await this.promotionRepo.createOrderPromotion(rs, {
          orderId,
          promotionId
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async applyOrderPromotion(rs: RequestScope, orderId: number, promotionId: number) {
    try {
      return rs.db.withTransaction<Promotion>(async () => {
        return await this.promotionRepo.createOrderPromotion(rs, {
          orderId,
          promotionId,
          appliedAt: new Date()
        });
      });
    } catch (error) {
      throw error;
    }
  }
}
