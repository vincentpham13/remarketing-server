import { inject, injectable } from 'inversify';

import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { ICampaignRepo } from '../repositories/campaign';
import { Campaign, CampaignUpdate } from '@/models/campaign';
import { InternalServerError } from '@/utils/http';


export interface ICampaignService {
  getAllCampaigns(rs: RequestScope): Promise<any[]>;
  create(rs: RequestScope, fanpage: Campaign): Promise<Campaign>;
  updateSuccessPart(rs: RequestScope, campaignId: number, success: number): Promise<Campaign>;
  forceComplete(rs: RequestScope, campaignId: number): Promise<Campaign>;
}

@injectable()
export class CampaignService implements ICampaignService {
  @inject(TYPES.CampaignRepo)
  private campaignRepo: ICampaignRepo;

  async getAllCampaigns(rs: RequestScope): Promise<any[]> {
    try {
      const campaigns = await this.campaignRepo.getAllByCreatorId(rs, rs.identity.getID());
      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  async create(rs: RequestScope, campaign: Campaign): Promise<Campaign> {
    try {
      const response = rs.db.withTransaction<Campaign>(async () => {
        campaign.creatorId = rs.identity.getID();
        const newCampaign = await this.campaignRepo.create(rs, campaign);
        return newCampaign;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateSuccessPart(rs: RequestScope, campaignId: number, success: number): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepo.getOneByCreatorId(rs, rs.identity.getID(), campaignId);
      console.log("🚀 ~ file: campaign.ts ~ line 46 ~ CampaignService ~ updateSuccessPart ~ campaign", campaign)
      const newSuccessMessages = success + (campaign.successMessages || 0);
      if (newSuccessMessages > campaign.totalMessages) {
        throw new InternalServerError(null, "Invalid data");
      }

      const response = rs.db.withTransaction<Campaign>(async () => {
        const updateCampaign: CampaignUpdate = {
          id: campaignId,
          "successMessages": newSuccessMessages,
        }
        if (newSuccessMessages === campaign.totalMessages) {
          updateCampaign["status"] = "completed";
        }

        const updatedCampaign = await this.campaignRepo.update(rs, updateCampaign);
        return updatedCampaign;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async forceComplete(rs: RequestScope, campaignId: number): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepo.getOneByCreatorId(rs, rs.identity.getID(), campaignId);

      if (!campaign.id) {
        throw new InternalServerError(null, "Campain does not exist");
      }

      const response = rs.db.withTransaction<Campaign>(async () => {
        const updateCampaign: CampaignUpdate = {
          id: campaignId,
          "status": 'completed',
        }

        const updatedCampaign = await this.campaignRepo.update(rs, updateCampaign);
        return updatedCampaign;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}
