import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';

import { } from '@/utils/http';
import { Order, OrderCreate, OrderUpdate } from '@/models/order';
import { IOrderRepo } from '../repositories/order';
import { OrderStatus } from '@/enums/orderStatus';
import { IUserRepo } from '../repositories/user';
import { TYPE } from 'inversify-express-utils';
import { IPackageRepo } from '../repositories/package';
import { Package } from '@/enums/package';
import { now } from 'moment-timezone';
import moment from 'moment';

export interface IOrderService {
  getAllOrder(rs: RequestScope): Promise<Order[]>;
  getOrderId(rs: RequestScope, id: string): Promise<Order>;
  getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
  createOrder(rs: RequestScope, order: OrderCreate): Promise<Order>;
  updateOrder(rs: RequestScope, order: OrderUpdate): Promise<Order>;
  confirmOrder(rs: RequestScope, order: Order): Promise<Order>;
  cancelOrder(rs: RequestScope, order: Order): Promise<Order>;
  deleteOrder(rs: RequestScope, id: string): Promise<any>;
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

  async getOrderId(rs: RequestScope, id: string): Promise<Order> {
    try {
      const order = await this.orderRepo.getOrdersById(rs, id);
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

  async createOrder(rs: RequestScope, order: OrderCreate): Promise<Order> {
    try {
      return rs.db.withTransaction<Order>(async () => {
        return await this.orderRepo.createOrder(rs, order);
      });
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(rs: RequestScope, order: OrderUpdate): Promise<Order> {
    try {
      return rs.db.withTransaction<Order>(async () => {
        return await this.orderRepo.updateOrder(rs, order);
      });
    } catch (error) {
      throw error;
    }
  }

  async confirmOrder(rs: RequestScope, order: Order): Promise<Order> {
    try {

      return rs.db.withTransaction<any>(async () => {
        let userPlan = await this.userRepo.getUserPlanById(rs, order.userId);
        const packageData = await this.packageRepo.getPackageById(rs, order.packageId);
        const newTotalMessage = userPlan.totalMessages + packageData.messageAmount * Package.MessageCountUnit;
        const newExpireDate = packageData.monthDuration != null
          ? moment(userPlan.validTo).add(packageData.monthDuration, 'months').toDate()
          : moment(userPlan.validTo).add(packageData.dayDuration, 'days').toDate();

        //update user plan
        const updatedUserPlan = await this.userRepo.updateUserPlan(rs, {
          userId: order.userId,
          totalMessages: newTotalMessage,
          validTo: newExpireDate,
        });

        //update order
        const updatedOrder = await this.orderRepo.updateOrder(rs, {
          id: order.id,
          status: OrderStatus.SUCCESS,
          updatedAt: moment().toDate().toDateString()
        })

        return updatedOrder;
      });
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(rs: RequestScope, order: Order): Promise<Order> {
    try {

      return rs.db.withTransaction<any>(async () => {

        const updatedOrder = await this.orderRepo.updateOrder(rs, {
          id: order.id,
          status: OrderStatus.CANCELLED,
          updatedAt: moment().toDate().toDateString()
        })

        return updatedOrder;
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(rs: RequestScope, id: string): Promise<any> {
    try {
      return rs.db.withTransaction<Order>(async () => {
        await this.orderRepo.deleteOrder(rs, id);
        return true;
      });
    } catch (error) {
      throw error;
    }
  }
}