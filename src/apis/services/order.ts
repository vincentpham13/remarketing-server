import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';

import { } from '@/utils/http';
import { Order, OrderCreate } from '@/models/order';
import { IOrderRepo } from '../repositories/order';

export interface IOrderService {
    getAllOrder(rs: RequestScope): Promise<Order[]>;
    getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
    createOrder(rs: RequestScope, order: OrderCreate): Promise<Order>;
    updateOrder(rs: RequestScope, order: Order): Promise<Order>;
    deleteOrder(rs: RequestScope, id: string): Promise<any>;
}

@injectable()
export class OrderService implements IOrderService{
    @inject(TYPES.OrderRepo)
    private orderRepo: IOrderRepo
    async getAllOrder(rs: RequestScope): Promise<Order[]>{
        try {
            const orders = await this.orderRepo.getAllOrder(rs);
            return orders;
          } catch (error) {
            throw error;
          }
    }

    async getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>{
      try {
        const orders = await this.orderRepo.getOrdersByUserId(rs, userId);
        return orders;
      } catch (error) {
        throw error;
      }
    }

    async createOrder(rs: RequestScope, order: OrderCreate): Promise<Order>{
      try {
        return rs.db.withTransaction<Order>(async () => {
          return await this.orderRepo.createOrder(rs, order);
        });
      } catch (error) {
        throw error;
      }
    }

    async updateOrder(rs: RequestScope, order: Order): Promise<Order>{
      try {
        return rs.db.withTransaction<Order>(async () => {
          return await this.orderRepo.updateOrder(rs, order);        
        });
      } catch (error) {
        throw error;
      }
    }
    async deleteOrder(rs: RequestScope, id: string): Promise<any>{
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