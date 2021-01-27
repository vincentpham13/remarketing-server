
import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost, httpPut } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';
import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { BadRequest, InternalServerError } from '@/utils/http';
import { UserRole } from '@/enums/userRole';
import { IUserService } from '@/apis/services/user';
import { IPackageService } from '@/apis/services/package';

@controller('/admin', AuthMiddleware(UserRole.Admin))
class AdminController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.PackageService) private packageService: IPackageService,
  ) {

  }

  @httpGet('/users')
  private async getUsers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.userService.getAllUsers(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/packages')
  private async getPackages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.packageService.getAllPackages(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(error);
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
      next(error);
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
      next(error);
    }
  }
}

export default AdminController;
