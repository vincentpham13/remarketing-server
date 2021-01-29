import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';

import { BadRequest, InternalServerError } from '@/utils/http';
import { Order, OrderCreate, OrderUpdate } from '@/models/order';
import { IOrderRepo } from '../repositories/order';
import { OrderStatus } from '@/enums/orderStatus';
import { IUserRepo } from '../repositories/user';
import { TYPE } from 'inversify-express-utils';
import { IPackageRepo } from '../repositories/package';
import { Package, PackageType } from '@/enums/package';
import { now } from 'moment-timezone';
import moment from 'moment';

export interface IOrderService {
  getAllOrder(rs: RequestScope): Promise<Order[]>;
  getOrderId(rs: RequestScope, id: number): Promise<Order>;
  getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
  createOrder(rs: RequestScope, order: OrderCreate): Promise<Order>;
  updateOrder(rs: RequestScope, order: OrderUpdate): Promise<Order>;
  confirmOrder(rs: RequestScope, orderId: number): Promise<Order>;
  cancelOrder(rs: RequestScope, order: Order): Promise<Order>;
  deleteOrder(rs: RequestScope, id: number): Promise<any>;
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

  async confirmOrder(rs: RequestScope, orderId: number): Promise<Order> {
    try {
      return rs.db.withTransaction<any>(async () => {

        // find order
        const existingOrder = await this.orderRepo.getOrderById(rs, orderId);
        if (!existingOrder) {
          throw new InternalServerError(null, "Order does not exist");
        }

        if(existingOrder.status === OrderStatus.CANCELLED){
          throw new BadRequest(null, "Your order has been cancelled");
        }
  
        if(existingOrder.status === OrderStatus.SUCCESS){
          throw new BadRequest(null, "Your order has been processed");
        }
        
        const userPlan = await this.userRepo.getUserPlanById(rs, existingOrder.userId);
        const orderPackages = await this.packageRepo.getPackagesByOrderId(rs, orderId);
        if(!orderPackages || (orderPackages && !orderPackages.length)) {
          throw new InternalServerError(null, "Ordered packages are empty");
        }

        let addMonthDuration = 0;
        let addMessageAmount = 0;
        for(const orderPackage of orderPackages) {
          if(orderPackage.packageTypeId === PackageType.TimeAndMessage) {
            addMonthDuration +=  orderPackage.monthDuration // moment(userPlan.validTo).add(orderPackage.monthDuration, 'months').toDate();
          }

          addMessageAmount += orderPackage.messageAmount * Package.MessageCountUnit;
        }

        //update user plan
        const updatedUserPlan = await this.userRepo.updateUserPlan(rs, {
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

  async deleteOrder(rs: RequestScope, id: number): Promise<any> {
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