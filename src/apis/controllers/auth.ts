import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import { IAuth } from '../../apis/services/auth';
import TYPES from '../../inversify/TYPES';
import { AuthMiddleware } from '@/apis/middlewares';

import {
  BadRequest,
  InternalServerError
} from '@/utils/http';
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

      const response = await this.authService.authenticate(req.requestScope, email, password);

      if (!response) {
        throw new InternalServerError('Fail to login')
      }

      res.status(200).json(response);

    } catch (error) {
      next(new InternalServerError(error, 'Fail to login'));
    }
  }

  @httpPost('/refresh-token', AuthMiddleware)
  private async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.authService.refreshToken(req.requestScope);

      if (!response) {
        throw new InternalServerError('Fail to refresh token')
      }

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, 'Fail to refresh token'));
    }
  }

  @httpPost('/logout', AuthMiddleware)
  private async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.logout(req.requestScope);
      res.status(200).json({ status: 'ok' })

    } catch (error) {
      next(new InternalServerError(error, 'Fail to logout'));
    }
  }

  @httpPost('/login/facebook')
  private async loginFacebook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const {
        fbUserId,
        accessToken
      } = req.body;

      if (!fbUserId || !accessToken) {
        throw new BadRequest(null, "Misinng fbUserId or accessToken")
      }

      const response = await this.authService.authenticateFB(req.requestScope, fbUserId, accessToken);

      res.status(200).json(response);

    } catch (error) {
      next(new InternalServerError(error, 'Failed to sign in with facebook account'));
    }
  }
}

export default AuthController;
