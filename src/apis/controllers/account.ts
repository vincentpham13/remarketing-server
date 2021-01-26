
import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import TYPES from '@/inversify/TYPES';
import {
  AuthMiddleware
} from '@/apis/middlewares';

import { IUserService } from '../services/user'
import { BadRequest, InternalServerError } from '@/utils/http';
import { inject } from 'inversify';
@controller('/account', AuthMiddleware)
class AccountController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService
  ) {
    
  }

  @httpGet('/me')
  private async getUserInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.userService.getUserInfo(req.requestScope, req.requestScope.identity.getID());
      console.log(response);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  @httpPost('/info')
  private async updateUserInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userInfo = req.body;
      if (!userInfo || !userInfo.id) {
        throw new BadRequest(null, "Invalid request body");
      }
      
      const response = await this.userService.updateUserInfo(req.requestScope, userInfo);
      res.status(200).json(response);

    } catch (error) {
      next(new InternalServerError(error));
    }
  }
}

export default AccountController;
