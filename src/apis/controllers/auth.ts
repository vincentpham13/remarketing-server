import express from 'express';
import { inject } from 'inversify';
import { interfaces, controller, httpGet } from "inversify-express-utils";

import { IAuth } from '../../apis/services/auth';
import TYPES from '../../inversify/TYPES';

@controller('/auth')
class AuthController implements interfaces.Controller {
  private authService: IAuth;
  constructor(
    @inject(TYPES.AuthServiceImpl) authService: IAuth,
  ) {
    this.authService = authService;
  }

  @httpGet('/')
  private index(req: express.Request, res: express.Response, next: express.NextFunction): void {
    this.authService.login();
    res.status(200).json({status: 'ok'})
  }
}

export default AuthController;
