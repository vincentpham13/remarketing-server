
import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';
import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { FanPageService } from '../services/fanpage';
import { BadRequest, InternalServerError } from '@/utils/http';

@controller('/fanpages', AuthMiddleware)
class FanPageController implements interfaces.Controller {
  constructor(
    @inject(TYPES.FanPageService) private fanPageService: FanPageService
  ) {
  }

  @httpGet('/')
  private async getAllFanPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.fanPageService.getAll(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:pageId')
  private async getOneFanPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pageId } = req.params;
      if (!pageId) {
        throw new BadRequest(null, "Invalid Page ID")
      }

      const response = await this.fanPageService.getOne(req.requestScope, pageId);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }
}

export default FanPageController;
