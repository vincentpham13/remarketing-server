import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';
import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { CampaignService } from '../services/campaign';
import { BadRequest, InternalServerError } from '@/utils/http';

@controller('/fanpages/:pageId/campaigns', AuthMiddleware)
class CampaignController implements interfaces.Controller {
    constructor(
        @inject(TYPES.CampaignService) private campaignService: CampaignService
      ) {
    }

    @httpGet('/')
    private async getAllByPageId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { pageId } = req.params;
            const response = await this.campaignService.getAllByPageId(req.requestScope, pageId);
            console.log('cc');
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

}
export default CampaignController;