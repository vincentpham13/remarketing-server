import moment from 'moment';
import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';

import { BadRequest, InternalServerError } from '@/utils/http';
import { Order, OrderCreate, OrderUpdate } from '@/models/order';
import { IOrderRepo } from '../repositories/order';
import { OrderStatus } from '@/enums/orderStatus';
import { IUserRepo } from '../repositories/user';
import { IPackageRepo } from '../repositories/package';
import { Package, PackageType } from '@/enums/package';

export interface IOrderService {
  getAllOrder(rs: RequestScope): Promise<Order[]>;
  getOrderId(rs: RequestScope, id: number): Promise<Order>;
  getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
  createOrder(rs: RequestScope, order: OrderCreate, packageIds: number[]): Promise<Order>;
  updateOrder(rs: RequestScope, order: OrderUpdate, packageIds: number[]): Promise<Order>;
  confirmOrder(rs: RequestScope, orderId: number): Promise<Order>;
  cancelOrder(rs: RequestScope, orderId: number): Promise<Order>;
  deleteOrder(rs: RequestScope, orderId: number): Promise<any>;
}

@injectable()
export class OrderService implements IOrderService {
  @inject(TYPES.OrderRepo)
  private orderRepo: IOrderRepo
  @inject(TYPES.UserRepo)
  private userRepo: IUserRepo
  @inject(TYPES.PackageRepo)
  private packageRepo: IPackageRepo

  async getAllOrder(rs: RequestScope): Promise<Order[]> {
    try {
      const orders = await this.orderRepo.getAllOrder(rs);
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getOrderId(rs: RequestScope, id: number): Promise<Order> {
    try {
      const order = await this.orderRepo.getOrderById(rs, id);
      return order;
    } catch (error) {
      throw error;
    }
  }

  async getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]> {
    try {
      const orders = await this.orderRepo.getOrdersByUserId(rs, userId);
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(rs: RequestScope, order: OrderCreate, packageIds: number[]): Promise<Order> {
    try {
      return await rs.db.withTransaction<Order>(async () => {

        if (!order.fullName) {
          throw new BadRequest(null, "Missing fullName");
        }

        if (!order.email) {
          throw new BadRequest(null, "Missing email");
        }

        if (!order.phone) {
          throw new BadRequest(null, "Missing phone");
        }

        const dbPackageIds = (await this.packageRepo.getAllPackage(rs)).map(p => p.id);

        if (!packageIds.every(packageId => dbPackageIds.includes(packageId))) {
          throw new BadRequest(null, "Provided packages are invalid");
        }

        //create order`
        const newOrder = await this.orderRepo.createOrder(rs, order);

        //create order package
        const createPackagePromises = packageIds.map(packageId => this.orderRepo.createOrderPackage(rs, {
          orderId: parseInt(newOrder.id, 10),
          packageId
        }));
        await Promise.all(createPackagePromises);

        return newOrder;
      });
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(rs: RequestScope, order: OrderUpdate, packageIds: number[]): Promise<Order> {
    try {
      const existingOrder = await this.orderRepo.getOrderById(rs, parseInt(order.id, 10));
      if (!existingOrder) {
        throw new BadRequest(null, "Order not exist");
      }

      if (existingOrder.status && !(existingOrder.status in OrderStatus)) {
        throw new BadRequest(null, "Invalid order status");
      }

      return rs.db.withTransaction<Order>(async () => {
        return await this.orderRepo.updateOrder(rs, order);
      });
    } catch (error) {
      throw error;
    }
  }

  async confirmOrder(rs: RequestScope, orderId: number): Promise<Order> {
    try {
      return rs.db.withTransaction<any>(async () => {

        // find order
        const existingOrder = await this.orderRepo.getOrderById(rs, orderId);
        if (!existingOrder) {
          throw new InternalServerError(null, "Order does not exist");
        }

        if (existingOrder.status === OrderStatus.CANCELLED) {
          throw new BadRequest(null, "Your order has been cancelled");
        }

        if (existingOrder.status === OrderStatus.SUCCESS) {
          throw new BadRequest(null, "Your order has been processed");
        }

        const userPlan = await this.userRepo.getUserPlanById(rs, existingOrder.userId);
        const orderPackages = await this.packageRepo.getPackagesByOrderId(rs, orderId);
        if (!orderPackages || (orderPackages && !orderPackages.length)) {
          throw new InternalServerError(null, "Ordered packages are empty");
        }

        let addMonthDuration = 0;
        let addMessageAmount = 0;
        for (const orderPackage of orderPackages) {
          if (orderPackage.packageTypeId === PackageType.TimeAndMessage) {
            addMonthDuration += orderPackage.monthDuration;
          }

          addMessageAmount += orderPackage.messageAmount * Package.MessageCountUnit;
        }

        //update user plan
        await this.userRepo.updateUserPlan(rs, {
          userId: existingOrder.userId,
          totalMessages: userPlan.totalMessages + addMessageAmount,
          validTo: moment(userPlan.validTo).add(addMonthDuration, 'months').toDate(),
        });

        //update order
        const updatedOrder = await this.orderRepo.updateOrder(rs, {
          id: existingOrder.id,
          status: OrderStatus.SUCCESS,
          updatedAt: new Date()
        });

        return updatedOrder;
      });
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(rs: RequestScope, orderId: number): Promise<Order> {
    try {

      const existingOrder = await this.orderRepo.getOrderById(rs, orderId);
      if (!existingOrder) {
        throw new BadRequest(null, "Order not exist");
      }

      if (existingOrder.status === OrderStatus.SUCCESS) {
        throw new BadRequest(null, "Your order has been processed");
      }

      if (existingOrder.status === OrderStatus.CANCELLED) {
        throw new BadRequest(null, "Your order has been cancelled");
      }

      return rs.db.withTransaction<any>(async () => {

        const updatedOrder = await this.orderRepo.updateOrder(rs, {
          id: existingOrder.id,
          status: OrderStatus.CANCELLED,
          updatedAt: new Date()
        })

        return updatedOrder;
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(rs: RequestScope, orderId: number): Promise<any> {
    try {
      return rs.db.withTransaction<Order>(async () => {
        await this.orderRepo.deleteOrder(rs, orderId);
        return true;
      });
    } catch (error) {
      throw error;
    }
  }
}