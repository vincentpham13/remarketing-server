import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';


import { BadRequest } from '@/utils/http';
import { IPromotionRepo } from '../repositories/promotion';
import { InvalidPromotion, Promotion, PromotionUpdate } from '@/models/promotion';
import { InvalidPromotionType } from '@/enums/promotion';

export interface IPromotionService {
  getAllPromotion(rs: RequestScope): Promise<Promotion[]>;
  getPromotionByCode(rs: RequestScope, promotionCode: string): Promise<Promotion>;
  createPromotion(rs: RequestScope, promotion: Promotion): Promise<Promotion>;
  updatePromotion(rs: RequestScope, promotion: PromotionUpdate): Promise<Promotion>;
  checkValidPromotions(promotions: Promotion[], packageIds?: number[], orderPrice?: number): InvalidPromotion[] | Promotion[];
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

  checkValidPromotions(promotions: Promotion[], packageIds?: number[], orderPrice?: number): InvalidPromotion[] | Promotion[] {
    let invalidPromotions = Array<InvalidPromotion>();
    for(let i = 0; i < promotions.length; i++){
      let promotion = promotions[i];
      if (promotion.validTo < new Date()) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          invalidType: InvalidPromotionType.Expired
        });
        continue;
      }
  
      if (promotion.quantity <= 0) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          invalidType: InvalidPromotionType.OutOfStock
        });
        continue;
      }
  
      if (promotion.validPackageIds && packageIds
        && !packageIds.every(packageId => promotion.validPackageIds?.includes(packageId))) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          invalidType: InvalidPromotionType.InvalidPackage
        });
      }
  
      if (promotion.validPrice && orderPrice && promotion.validPrice > orderPrice) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          invalidType: InvalidPromotionType.InvalidPrice
        });
      }
    }
    if(invalidPromotions.length > 0){
      return invalidPromotions;
    }
    
    return promotions;
    
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
        const existingPromotion = await this.promotionRepo.getPromotionByCode(rs, promotion.code);
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
        const existingPromotion = await this.promotionRepo.getPromotionByCode(rs, promotion.code.toString());
        if(existingPromotion && existingPromotion.id != promotion.id){
          throw new BadRequest(null, "Promotion code already exist");
        }
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
}
