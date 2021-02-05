import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { OrderPromotion, Promotion, PromotionUpdate } from '@/models/promotion';
import { Order } from '@/models/order';

export interface IPromotionRepo {
  getAllPromotion(rs: RequestScope): Promise<Promotion[]>;
  getPromotionById(rs: RequestScope, id: number): Promise<Promotion>;
  getPromotionByCode(rs: RequestScope, code: string): Promise<Promotion>;
  createPromotion(rs: RequestScope, user: Promotion): Promise<Promotion>;
  updatePromotion(rs: RequestScope, promotion: PromotionUpdate): Promise<Promotion>;
  createOrderPromotion(rs: RequestScope, orderPromotion: OrderPromotion): Promise<OrderPromotion>;
  updateOrderPromotion(rs: RequestScope, orderPromotion: OrderPromotion): Promise<OrderPromotion>;
}

@injectable()
export class PromotionRepo implements IPromotionRepo {
  async getAllPromotion(rs: RequestScope): Promise<Promotion[]>{
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["*"])
      .from<Promotion>("promotion");
  }

  async getPromotionById(rs: RequestScope, id: number): Promise<Promotion>{
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["*"])
      .from<Promotion>("promotion")
      .where("id", id)
      .first();
  }

  async getPromotionByCode(rs: RequestScope, code: string): Promise<Promotion>{
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["*"])
      .from<Promotion>("promotion")
      .where("code", code)
      .first();
  }

  async createPromotion(rs: RequestScope, promotion: Promotion): Promise<Promotion> {
    rs.db.prepare();
    const [inserted] = await rs.db.queryBuilder
      .insert(promotion, "*")
      .into<Promotion>("promotion");

    return inserted;
  }

  async updatePromotion(rs: RequestScope, promotion: PromotionUpdate): Promise<Promotion> {
    rs.db.prepare();
    const [updated] = await rs.db.queryBuilder
      .update(promotion)
      .into<Promotion>("promotion")
      .where("id", promotion.id)
      .returning("*");
    return updated;
  }

  async createOrderPromotion(rs: RequestScope, orderPromotion: OrderPromotion): Promise<OrderPromotion> {
    rs.db.prepare();
    const [inserted] = await rs.db.queryBuilder
      .insert(orderPromotion, "*")
      .into<OrderPromotion>("order_promotion");
    return inserted;
  }

  async updateOrderPromotion(rs: RequestScope, orderPromotion: OrderPromotion): Promise<OrderPromotion> {
    rs.db.prepare();
    const [updated] = await rs.db.queryBuilder
      .update(orderPromotion)
      .into<OrderPromotion>("order_promotion")
      .where("protmotion_id", orderPromotion.promotionId)
      .where("order_id", orderPromotion.orderId)
      .returning("*");
    return updated;
  }
}