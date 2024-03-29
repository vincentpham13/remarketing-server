
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
import { PackageType } from '@/enums/package';
import { IPromotionService } from '@/apis/services/promotion';

@controller('/admin', AuthMiddleware(UserRole.Admin))
class AdminController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.PackageService) private packageService: IPackageService,
    @inject(TYPES.OrderService) private orderService: IOrderService,
    @inject(TYPES.PromotionService) private promotionService: IPromotionService,

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

  @httpGet('/promotions')
  private async getPromotions(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.promotionService.getAllPromotion(req.requestScope);
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
        price,
        packageTypeId,
      } = req.body;

      if (!label || !monthDuration || !messageAmount || !price || !packageTypeId) {
        throw new BadRequest(null, "Invalid package");
      }

      const response = await this.packageService.createPackage(req.requestScope, {
        label,
        monthDuration: packageTypeId === PackageType.MessageOnly ? 0 : monthDuration,
        messageAmount: messageAmount,
        price,
        packageTypeId,
      });
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpDelete('/packages/:id')
  private async removePackages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequest(null, 'missing package id');
      }
      await this.packageService.removePackage(req.requestScope, parseInt(id, 10));
    } catch (error) {
      throw new InternalServerError(error, "Failed to remove package");
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
      const { id } = req.params
      const {
        userId,
        fullName,
        email,
        phone,
        address,
        businessName,
        businessAddress,
        emailReceipt,
        taxId,
        status,
        packageIds,
      } = req.body;

      if (!id) {
        throw new BadRequest(null, 'missing order id');
      }

      if (!userId || !packageIds || !status) {
        throw new BadRequest(null, "Invalid order");
      }

      // const response = await this.orderService.updateOrder(req.requestScope, {
      //   id,
      //   userId,
      //   status,
      //   packageIds,
      // },);

      // res.status(200).json(response);
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

      const response = await this.orderService.cancelOrder(req.requestScope, parseInt(id, 10));

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
  
  @httpPost('/promotions')
  private async createPromotion(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {

      const {
        code,
        description,
        quantity,
        validPackageIds,
        monthDuration,
        messageAmount,
        validPrice,
        canUseWithOther,
        validTo,
      } = req.body;
      
      if (!code || !quantity || (!monthDuration && !messageAmount) || !validTo) {
        throw new BadRequest(null, "Invalid promotion");
      }

      const response = await this.promotionService.createPromotion(req.requestScope, {
        code,
        description,
        quantity,
        validPackageIds,
        monthDuration,
        messageAmount,
        validPrice,
        canUseWithOther,
        validTo,
      });
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpPut('/promotions/:id')
  private async updatePromotion(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequest(null, 'missing promotion id');
      }
      const {
        code,
        description,
        quantity,
        validPackageIds,
        monthDuration,
        messageAmount,
        validPrice,
        canUseWithOther,
        validTo,
      } = req.body;

      if (!code || (!monthDuration && !messageAmount) || !validTo) {
        throw new BadRequest(null, "Invalid promotion");
      }
      const response = await this.promotionService.updatePromotion(req.requestScope, {
        id: parseInt(id,20),
        code,
        description,
        quantity,
        validPackageIds,
        monthDuration,
        messageAmount,
        validPrice,
        canUseWithOther,
        validTo,
        updatedAt: new Date()
      });
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }
  
}

export default AdminController;
