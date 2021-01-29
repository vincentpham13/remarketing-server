
import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';
import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { BadRequest, InternalServerError, Unauthorized } from '@/utils/http';
import { UserRole } from '@/enums/userRole';
import { IUserService } from '@/apis/services/user';
import { IPackageService } from '@/apis/services/package';
import { IOrderService } from '@/apis/services/order';
import { OrderStatus } from '@/enums/orderStatus';
import { RequestScope } from '@/models/request';
import { stat } from 'fs';

@controller('/admin', AuthMiddleware(UserRole.Admin))
class AdminController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.PackageService) private packageService: IPackageService,
    @inject(TYPES.OrderService) private orderService: IOrderService,

  ) {

  }

  @httpGet('/users')
  private async getUsers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.userService.getAllUsers(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpGet('/packages')
  private async getPackages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.packageService.getAllPackages(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpPost('/packages')
  private async createPackages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        label,
        monthDuration,
        messageAmount,
        price
      } = req.body;

      if (!label || !monthDuration || !messageAmount || !price) {
        throw new BadRequest(null, "Invalid package");
      }

      const response = await this.packageService.createPackage(req.requestScope, {
        label,
        monthDuration,
        messageAmount,
        price,
      });
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }
  @httpPut('/packages/:id')
  private async updatePackages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequest(null, 'missing package id');
      }

      const {
        label,
        monthDuration,
        messageAmount,
        price
      } = req.body;

      if (!label || !monthDuration || !messageAmount || !price) {
        throw new BadRequest(null, "Invalid package");
      }

      const response = await this.packageService.updatePackage(req.requestScope, parseInt(id, 10), {
        label,
        monthDuration,
        messageAmount,
        price,
      });
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpGet('/orders')
  private async getOrders(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.orderService.getAllOrder(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpPut('/orders/:id')
  private async updateOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        id,
        userId,
        packageId,
        status,
      } = req.body;

      if (!id) {
        throw new BadRequest(null, 'missing order id');
      }

      if (!userId || !packageId || !status) {
        throw new BadRequest(null, "Invalid order");
      }

      const order = await this.orderService.getOrderId(req.requestScope, id);
      if (!order) {
        throw new BadRequest(null, "Order not exist");
      }

      if(!Object.values(OrderStatus).includes(status)){
        throw new BadRequest(null, "Invalid order status");
      }

      if(status === order.status){
        throw new BadRequest(null, "Your order has been updated");
      }

      const response = await this.orderService.updateOrder(req.requestScope, {
        id,
        userId,
        packageId,
        status,
      });

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, "Fail to"));
    }
  }

  @httpPost('/orders/:id/confirm')
  private async confirmOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequest(null, 'missing order id');
      }

      const response = await this.orderService.confirmOrder(req.requestScope, parseInt(id, 10));

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpPost('/orders/:id/cancel')
  private async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequest(null, 'missing order id');
      }

      let order = await this.orderService.getOrderId(req.requestScope, parseInt(id, 10));
      if (!order) {
        throw new BadRequest(null, "Order not exist");
      }

      if(order.status === OrderStatus.SUCCESS){
        throw new BadRequest(null, "Your order has been processed");
      }

      if(order.status === OrderStatus.CANCELLED){
        throw new BadRequest(null, "Your order has been cancelled");
      }

      const response = await this.orderService.cancelOrder(req.requestScope, order);

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }


  @httpDelete('/orders/:id')
  private async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequest(null, 'missing order id');
      }
      const response = await this.orderService.deleteOrder(req.requestScope, parseInt(id, 10));
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }
}

export default AdminController;
