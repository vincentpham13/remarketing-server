
import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';
import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { BadRequest, InternalServerError } from '@/utils/http';
import { UserRole } from '@/enums/userRole';
import { IUserService } from '@/apis/services/user';

@controller('/admin', AuthMiddleware(UserRole.Admin))
class AdminController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService
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
}

export default AdminController;
