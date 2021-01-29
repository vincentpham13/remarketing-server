import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { Order, OrderCreate, OrderPackage, OrderUpdate } from '@/models/order';

export interface IOrderRepo {
  getAllOrder(rs: RequestScope): Promise<Order[]>;
  getOrderById(rs: RequestScope, orderId: number): Promise<Order>;
  getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
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
      .groupBy("o.id")
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
      .first();
  }

  async getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]> {
    rs.db.prepare();

    const orders = await rs.db.queryBuilder
      .select(["*"])
      .from<Order>("order")
      .where('user_id', userId)
    return orders;
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