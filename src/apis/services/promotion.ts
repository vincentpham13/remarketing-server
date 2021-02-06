import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';


import { BadRequest } from '@/utils/http';
import { IPromotionRepo } from '../repositories/promotion';
import { InvalidPromotion, Promotion, PromotionUpdate } from '@/models/promotion';
import { InvalidPromotionType } from '@/enums/promotion';
import { IPackageRepo } from '../repositories/package';

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
  @inject(TYPES.PackageRepo)
  private packageRepo: IPackageRepo;

  async getAllPromotion(rs: RequestScope): Promise<Promotion[]> {
    try {
      const promotion = await this.promotionRepo.getAllPromotion(rs);
      return promotion;
    } catch (error) {
      throw error;
    }
  }

  checkValidPromotions(promotions: Promotion[], packageIds?: number[], orderPrice?: number): InvalidPromotion[] | Promotion[] {
    const invalidPromotions = Array<InvalidPromotion>();
    for (let i = 0; i < promotions.length; i++) {
      const promotion = promotions[i];
      if (promotion.validTo < new Date()) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          error: {
            message: "Mã " + promotion.code + " đã hết hạn",
            code: InvalidPromotionType.Expired
          }
        });
        continue;
      }

      if (promotion.quantity <= 0) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          error: {
            message: "Mã " + promotion.code + " đã hết",
            code: InvalidPromotionType.OutOfStock
          }
        });
        continue;
      }
      if (promotion.validPackageIds?.length && packageIds
        && packageIds.some(packageId => !promotion.validPackageIds?.includes(packageId))) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          error: {
            message: "Mã " + promotion.code + " không sử dụng cho gói bạn chọn",
            code: InvalidPromotionType.InvalidPackage
          }
        });
      }

      if (promotion.validPrice && orderPrice && promotion.validPrice > orderPrice) {
        invalidPromotions.push({
          promotionCode: promotion.code,
          error: {
            message: "Mã " + promotion.code + " chỉ được áp dụng với đơn hàng có giá trị trên " + promotion.validPrice + "VNĐ",
            code: InvalidPromotionType.InvalidPrice
          }
        });
      }
    }
    if (invalidPromotions.length > 0) {
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
        if (existingPromotion) {
          throw new BadRequest(null, "Promotion code already exist");
        }
        if (promotion.validPackageIds) {
          const packages = await this.packageRepo.getPackagesByIds(rs, promotion.validPackageIds);
          if (packages.length !== promotion.validPackageIds.length){
            throw new BadRequest(null, "Package invalid");
          }
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
        if (existingPromotion && existingPromotion.id != promotion.id) {
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
