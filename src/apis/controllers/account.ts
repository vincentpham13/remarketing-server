
import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';

@controller('/account', AuthMiddleware)
class AccountController implements interfaces.Controller {
  constructor(
  ) {
    
  }

  @httpPost('/test')
  private async test(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('here');
      res.status(200).json(req.requestScope.identity)
    } catch (error) {
      next(error);
    }
  }
}

export default AccountController;
