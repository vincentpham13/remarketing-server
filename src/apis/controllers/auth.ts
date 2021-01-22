import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import { IAuth } from '../../apis/services/auth';
import TYPES from '../../inversify/TYPES';
import { BodyParserMiddleware } from '@/apis/middlewares';
@controller('/auth')
class AuthController implements interfaces.Controller {
  private authService: IAuth;
  constructor(
    @inject(TYPES.AuthServiceImpl) authService: IAuth,
  ) {
    this.authService = authService;
  }

  @httpGet('/')
  private async index(req: Request, res: Response, next: NextFunction): Promise<void> {

    res.status(200).json({ status: 'ok' })
  }

  @httpPost('/login')
  private async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        email,
        password
      } = req.body;
      if (!email || !password) {
        throw new Error('Missing email or password');
      }

      const accessToken = await this.authService.authenticate(req.requestScope, email, password);
      res.status(200).json({
        accessToken,
      })
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/login/facebook/callback')
  private async facebookCallBack(req: Request, res: Response, next: NextFunction): Promise<void> {
    const accessToken = req.query?.access_token;

    res.status(200).json({
      status: req.query?.access_token,
      accessToken,
    })
  }
}

export default AuthController;
