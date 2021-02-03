import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { Order, OrderCreate, OrderPackage, OrderUpdate } from '@/models/order';
import { off } from 'process';

export interface IOrderRepo {
  getAllOrder(rs: RequestScope): Promise<Order[]>;
  getOrderById(rs: RequestScope, orderId: number): Promise<Order>;
  getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
  getOrdersByUserIdPaging(rs: RequestScope, userId: string, limit?: number, offset?: number, orderByRaw?: string): Promise<Order[]>;
  createOrder(rs: RequestScope, order: OrderCreate): Promise<Order>;
  createOrderPackage(rs: RequestScope, orderPackage: OrderPackage): Promise<OrderPackage>;
  updateOrder(rs: RequestScope, order: OrderUpdate): Promise<Order>;
  deleteOrder(rs: RequestScope, id: number): Promise<any>;
}

@injectable()
export class OrderRepo implements IOrderRepo {
  async getAllOrder(rs: RequestScope): Promise<Order[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select([
        "o.*",
        rs.db.client.raw(
          `array_agg(to_jsonb(p)) as packages`
        ),
      ])
      .from<Order>("order as o")
      .innerJoin("order_package as op", "op.order_id", "=", "o.id")
      .innerJoin("package as p", "op.package_id", "=", "p.id")
      .groupBy("o.id");
  }

  async getOrderById(rs: RequestScope, orderId: number): Promise<Order> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select([
        "o.*",
        rs.db.client.raw(
          `array_agg(to_jsonb(p)) as packages`
        ),
      ])
      .from<Order>("order as o")
      .innerJoin("order_package as op", "op.order_id", "=", "o.id")
      .innerJoin("package as p", "op.package_id", "=", "p.id")
      .groupBy("o.id")
      .where("o.id", orderId)
      .first();
  }

  async getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select([
        "o.*",
        rs.db.client.raw(
          `array_agg(to_jsonb(p)) as packages`
        ),
      ])
      .from<Order>("order as o")
      .innerJoin("order_package as op", "op.order_id", "=", "o.id")
      .innerJoin("package as p", "op.package_id", "=", "p.id")
      .groupBy("o.id")
      .where("user_id", userId);
  }

  async getOrdersByUserIdPaging(rs: RequestScope, userId: string, limit: number, offset: number, orderByRaw?: string): Promise<Order[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
    .select([
      "o.*",
      rs.db.client.raw(`sum(p.price) as total_price`),
      rs.db.client.raw(`array_agg(p.label) as labels`),
      rs.db.client.raw(`array_agg(p.month_duration) as month_durations`),
      rs.db.client.raw(`array_agg(p.day_duration) as day_durations`),
      rs.db.client.raw(`array_agg(p.message_amount) as message_amounts`),
    ])
    .from<Order>("order as o")
    .innerJoin("order_package as op", "op.order_id", "=", "o.id")
    .innerJoin("package as p", "op.package_id", "=", "p.id")
    .groupBy("o.id")
    .where("user_id", userId)
    .limit(limit)
    .offset(offset)
    .orderByRaw(orderByRaw ? orderByRaw : 'o.created_at DESC');
  }

  async createOrder(rs: RequestScope, order: OrderCreate): Promise<Order> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(order, "*")
      .into<Order>("order");
    return inserted;
  }

  async createOrderPackage(rs: RequestScope, orderPackage: OrderPackage): Promise<OrderPackage> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(orderPackage, "*")
      .into<OrderPackage>("order_package");
    return inserted;
  }

  async updateOrder(rs: RequestScope, order: OrderUpdate): Promise<Order> {
    rs.db.prepare();

    const [updated] = await rs.db.queryBuilder
      .update(order)
      .into<Order>("order")
      .returning("*")
      .where("id", order.id)
    return updated;
  }

  async deleteOrder(rs: RequestScope, orderId: number): Promise<any> {
    rs.db.prepare();

    await rs.db.queryBuilder
      .del()
      .from<Order>("order")
      .where("id", orderId);
    return true;
  }
}