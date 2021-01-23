import { inject, injectable } from 'inversify';

import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { ICampaignRepo } from '../repositories/campaign';
import { Campaign } from '@/models/campaign';


export interface ICampaignService {
    getAllByPageId(rs: RequestScope, pageId: string): Promise<any[]>;
    create(rs: RequestScope, fanpage: Campaign): Promise<Campaign>;
}

@injectable()
export class CampaignService implements ICampaignService {
  @inject(TYPES.CampaignRepo)
  private campaignRepo: ICampaignRepo;

  async getAllByPageId(rs: RequestScope, pageId: string): Promise<any[]> {
    try {
      const campaigns = await this.campaignRepo.getAllByPageId(rs, pageId);
      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  async create(rs: RequestScope, campaign: Campaign): Promise<Campaign> {
    try {
        const newCampaign = await this.campaignRepo.create(rs, campaign);
        return newCampaign;
      } catch (error) {
        throw error;
      }
  }
}