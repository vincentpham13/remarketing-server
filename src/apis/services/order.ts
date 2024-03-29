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
import { IPromotionRepo } from '../repositories/promotion';
import { IPromotionService } from './promotion';
import { instanceOfInvalidPromotion} from '@/models/promotion';

export interface IOrderService {
  getAllOrder(rs: RequestScope): Promise<Order[]>;
  getOrderId(rs: RequestScope, id: number): Promise<Order>;
  getOrdersByUserId(rs: RequestScope, userId: string): Promise<Order[]>;
  createOrder(rs: RequestScope, order: OrderCreate, packageIds: number[], promotionIds: number[]): Promise<Order>;
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
  @inject(TYPES.PromotionRepo)
  private promotionRepo: IPromotionRepo
  @inject(TYPES.PromotionService)
  private promotionService: IPromotionService

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

  async createOrder(rs: RequestScope, order: OrderCreate, packageIds: number[], promotionIds: number[]): Promise<Order> {
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

        const dbPackages = (await this.packageRepo.getAllPackage(rs));
        const dbPackageIds = dbPackages.map(p => p.id);

        if (!packageIds.every(packageId => dbPackageIds.includes(packageId))) {
          throw new BadRequest(null, "Provided packages are invalid");
        }
        //create order`
        const newOrder = await this.orderRepo.createOrder(rs, order);

        const packages = await this.packageRepo.getPackagesByIds(rs,packageIds);
        //create order package
        const createPackagePromises = packages.map(packageItem => this.orderRepo.createOrderPackage(rs, {
          orderId: newOrder.id,
          packageId: packageItem.id,
          messageAmount: packageItem.messageAmount,
          monthDuration: packageItem.monthDuration
        }));

        await Promise.all(createPackagePromises);
        if(promotionIds){
          const orderPrice = await this.packageRepo.getTotalPriceByIds(rs, packageIds);
          const promotions = await this.promotionRepo.getPromotionsByIds(rs, promotionIds);  
          const invalidPromotions = this.promotionService.checkValidPromotions(promotions,packageIds,orderPrice);
          console.log(invalidPromotions);
          if(invalidPromotions.length && instanceOfInvalidPromotion(invalidPromotions[0])){
            throw new BadRequest(null, "Invalid promotion");
          }

          //update promotion quantity
          const updateQuantityPromotionPromises = promotions.map(promotion => {
            if(promotion.id){
              
              //create order promotion
              this.promotionRepo.createOrderPromotion(rs, {
                orderId: newOrder.id,
                promotionId: promotion.id,
                monthDuration: promotion.monthDuration,
                messageAmount: promotion.messageAmount
              });
              this.promotionRepo.updatePromotion(rs, {
                id: promotion.id,
                quantity: promotion.quantity -1
              });
            }   
          });
          await Promise.all(updateQuantityPromotionPromises);
        }

        return await this.orderRepo.getOrderById(rs, newOrder.id);
      });
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(rs: RequestScope, order: OrderUpdate, packageIds: number[]): Promise<Order> {
    try {
      const existingOrder = await this.orderRepo.getOrderById(rs, order.id);
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

        if (existingOrder.status === OrderStatus.Cancelled) {
          throw new BadRequest(null, "Your order has been cancelled");
        }

        if (existingOrder.status === OrderStatus.Success) {
          throw new BadRequest(null, "Your order has been processed");
        }

        const userPlan = await this.userRepo.getUserPlanById(rs, existingOrder.userId);
        const orderPackages = await this.packageRepo.getValidOrderPackagesByOrderId(rs, orderId);
      
        if (!orderPackages || (orderPackages && !orderPackages.length)) {
          throw new InternalServerError(null, "Ordered packages are empty");
        }

        let addMonthDuration = 0;
        let addMessageAmount = 0;
        let unlimitedPackageId = 0;
        for (const orderPackage of orderPackages) {
          if (orderPackage.packageTypeId === PackageType.TimeAndMessage) {
            addMonthDuration += orderPackage.monthDuration ?? 0;
          }

          if(addMessageAmount == PackageType.UnlimitedMessageAmount){
            continue;
          }

          // is unlimited package
          if(orderPackage.messageAmount === PackageType.UnlimitedMessageAmount){
            addMessageAmount = PackageType.UnlimitedMessageAmount;
            unlimitedPackageId = orderPackage.packageId;
          }else{
            addMessageAmount += (orderPackage.messageAmount ?? 0) * Package.MessageCountUnit;
          }

          await this.packageRepo.updateOrderPackage(rs, {
            orderId,
            packageId: orderPackage.packageId,
            appliedAt: new Date()
          });
        }


        //apply promotion
        const orderPromotions = await this.promotionRepo.getValidOrderPromotionsByOrder(rs,orderId);
        if(orderPromotions){
          for(let i = 0; i < orderPromotions.length; i++){
            const orderPromotion = orderPromotions[i];
            addMonthDuration += orderPromotion.monthDuration ?? 0;
            if(addMessageAmount != PackageType.UnlimitedMessageAmount){
              addMessageAmount += orderPromotion.messageAmount ?? 0;
            }
            await this.promotionRepo.updateOrderPromotion(rs, {
              orderId,
              promotionId: orderPromotion.promotionId,
              appliedAt: new Date()
            });
          }
        }
        
        //update user plan
        await this.userRepo.updateUserPlan(rs, {
          userId: existingOrder.userId,
          packageId: unlimitedPackageId !== 0 ? unlimitedPackageId: userPlan.packageId,
          totalMessages: (
              addMessageAmount == PackageType.UnlimitedMessageAmount 
              ? PackageType.UnlimitedMessageAmount 
              : (userPlan.totalMessages === PackageType.UnlimitedMessageAmount ? 0 : userPlan.totalMessages)
               + addMessageAmount
          ),
          validTo: moment(userPlan.validTo).add(addMonthDuration, 'months').toDate(),
        });

        //update order
        const updatedOrder = await this.orderRepo.updateOrder(rs, {
          id: existingOrder.id,
          status: OrderStatus.Success,
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

      if (existingOrder.status === OrderStatus.Success) {
        throw new BadRequest(null, "Your order has been processed");
      }

      if (existingOrder.status === OrderStatus.Cancelled) {
        throw new BadRequest(null, "Your order has been cancelled");
      }

      return rs.db.withTransaction<any>(async () => {

        const updatedOrder = await this.orderRepo.updateOrder(rs, {
          id: existingOrder.id,
          status: OrderStatus.Cancelled,
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