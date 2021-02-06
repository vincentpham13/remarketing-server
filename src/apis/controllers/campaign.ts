import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost, httpPut } from "inversify-express-utils";

import {
  AuthMiddleware
} from '@/apis/middlewares';
import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { ICampaignService } from '../services/campaign';
import { BadRequest, InternalServerError } from '@/utils/http';
import { UserRole } from '@/enums/userRole';

@controller('/campaigns', AuthMiddleware())
class CampaignController implements interfaces.Controller {
  constructor(
    @inject(TYPES.CampaignService) private campaignService: ICampaignService
  ) {
  }

  @httpGet('/')
  private async getAllCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.campaignService.getAllCampaigns(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }

  @httpPost('/')
  private async createCompaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        pageId,
        memberUIDs,
        message
      } = req.body;

      if (!name || !pageId || !memberUIDs?.length || !message) {
        throw new BadRequest(null, "Invalid request body");
      }

      const response = await this.campaignService.create(req.requestScope, {
        name: name,
        pageId: pageId,
        totalMessages: memberUIDs.length,
        message,
        createdAt: new Date()
      }, memberUIDs);

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }

  @httpPut('/:campaignId')
  private async updateSuccessPart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campaignId } = req.params;
      if (!campaignId) {
        throw new BadRequest(null, "Missing param");
      }

      const {
        success
      } = req.body;
      if (!success) {
        throw new BadRequest(null, "Invalid request body");
      }

      const parsedCampaignId = parseInt(campaignId, 10);
      const response = await this.campaignService.updateSuccessPart(req.requestScope, parsedCampaignId, success);

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }

  @httpPost('/:campaignId/start')
  private async startCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campaignId } = req.params;
      if (!campaignId) {
        throw new BadRequest(null, "Missing param");
      }

      const parsedCampaignId = parseInt(campaignId, 10);
      const response = await this.campaignService.startCampaign(req.requestScope, parsedCampaignId);

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }

  @httpPost('/:campaignId/force-complete')
  private async forceComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campaignId } = req.params;
      if (!campaignId) {
        throw new BadRequest(null, "Missing param");
      }

      const parsedCampaignId = parseInt(campaignId, 10);
      const response = await this.campaignService.forceComplete(req.requestScope, parsedCampaignId);

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }

  @httpGet('/:campaignId/members')
  private async getCampaignMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campaignId } = req.params;
      if (!campaignId) {
        throw new BadRequest(null, "Missing param");
      }

      const parsedCampaignId = parseInt(campaignId, 10);
      const response = await this.campaignService.getCampaignMembers(req.requestScope, parsedCampaignId);

      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error));
    }
  }
}

export default CampaignController;