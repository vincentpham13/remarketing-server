import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { OrderPromotion, Promotion, PromotionUpdate } from '@/models/promotion';
import { Order } from '@/models/order';

export interface IPromotionRepo {
  getAllPromotion(rs: RequestScope): Promise<Promotion[]>;
  getPromotionsByIds(rs: RequestScope, ids: number[]): Promise<Promotion[]>;
  getPromotionByCode(rs: RequestScope, code: string): Promise<Promotion>;
  createPromotion(rs: RequestScope, user: Promotion): Promise<Promotion>;
  updatePromotion(rs: RequestScope, promotion: PromotionUpdate): Promise<Promotion>;
  getValidOrderPromotionsByOrder(rs: RequestScope, orderId: number): Promise<OrderPromotion[]>;
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

  async getPromotionsByIds(rs: RequestScope, ids: number[]): Promise<Promotion[]>{
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["*"])
      .from<Promotion>("promotion")
      .whereIn("id", ids);
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

  async getValidOrderPromotionsByOrder(rs: RequestScope, orderId: number): Promise<OrderPromotion[]>{
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["po.*"])
      .from<OrderPromotion>("order_promotion as po")
      .where("po.order_id", orderId)
      .whereNull("po.applied_at");
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
      .where("promotion_id", orderPromotion.promotionId)
      .where("order_id", orderPromotion.orderId)
      .returning("*");
    return updated;
  }
}