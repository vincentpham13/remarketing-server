import { Request, Response, NextFunction, CookieOptions } from 'express';
import { inject } from 'inversify';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import { IAuth } from '../../apis/services/auth';
import TYPES from '../../inversify/TYPES';
import { AuthMiddleware } from '@/apis/middlewares';

import {
  BadRequest,
  InternalServerError,
  Unauthorized
} from '@/utils/http';
import { decodeJwtToken } from '@/utils/jwt';

const options: CookieOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 1month
  sameSite: 'none',
  httpOnly: true, // Only server accesses cookie
  secure: process.env.NODE_ENV === 'production', // client servers over https
  signed: true
};

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
      const { refreshToken } = response;

      //Set refresh token in httpOnly cookie
      res.cookie('rt', refreshToken, options);

      if (!response) {
        throw new InternalServerError('Fail to login')
      }

      delete response.refreshToken;
      res.status(200).json(response);

    } catch (error) {
      next(new InternalServerError(error, 'Fail to login'));
    }
  }

  @httpPost('/refresh-token')
  private async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      //Get the refresh token from cookie
      const { rt } = req.signedCookies;

      if (rt === null) {
        throw new BadRequest(null, 'Missing rt cookie');
      }

      const decodedToken = decodeJwtToken(rt);
      if (!decodedToken) {
        throw new Unauthorized(null, 'Session expired')
      }

      const response = await this.authService.refreshToken(req.requestScope, decodedToken.id);
      const { refreshToken } = response;

      //Set refresh token in httpOnly cookie
      res.clearCookie('rt');

      res.cookie('rt', refreshToken, options);

      if (!response) {
        throw new InternalServerError('Fail to refresh token')
      }

      delete response.refreshToken;
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, 'Fail to refresh token'));
    }
  }

  @httpPost('/logout', AuthMiddleware())
  private async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('rt');
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
      const { refreshToken } = response;

      //Set refresh token in httpOnly cookie
      res.cookie('rt', refreshToken, options);

      delete response.refreshToken;
      res.status(200).json(response);

    } catch (error) {
      next(new InternalServerError(error, 'Failed to sign in with facebook account'));
    }
  }
}

export default AuthController;
