import { inject, injectable } from 'inversify';

import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { ICampaignRepo } from '../repositories/campaign';
import { Campaign, CampaignUpdate } from '@/models/campaign';
import { InternalServerError } from '@/utils/http';
import { IUserRepo } from '../repositories/user';
import { CampaignStatus } from '@/enums/campaignStatus';
import { IFanPageRepo } from '../repositories/fanpage';
import { compare } from 'bcrypt';
import { Member } from '@/models/fanpage';
import { PackageType } from '@/enums/package';


export interface ICampaignService {
  getAllCampaigns(rs: RequestScope): Promise<any[]>;
  create(rs: RequestScope, campaign: Campaign, memberUIDs: string[]): Promise<Campaign>;
  startCampaign(rs: RequestScope, campaignId: number): Promise<Campaign>;
  updateSuccessPart(rs: RequestScope, campaignId: number, success: number): Promise<Campaign>;
  forceComplete(rs: RequestScope, campaignId: number): Promise<Campaign>;
  getCampaignMembers(rs: RequestScope, campaignId: number): Promise<Member[]>;
}

@injectable()
export class CampaignService implements ICampaignService {
  @inject(TYPES.CampaignRepo)
  private campaignRepo: ICampaignRepo;
  @inject(TYPES.UserRepo)
  private userRepo: IUserRepo;
  @inject(TYPES.FanPageRepo)
  private fanPageRepo: IFanPageRepo;

  async getAllCampaigns(rs: RequestScope): Promise<any[]> {
    try {
      const campaigns = await this.campaignRepo.getAllByCreatorId(rs, rs.identity.getID());
      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  async create(rs: RequestScope, campaign: Campaign, memberUIDs: string[]): Promise<Campaign> {
    try {
      const userId = rs.identity.getID();
      const fanPage = this.fanPageRepo.getOneByUserId(rs, userId, campaign.pageId);
      if (!fanPage) {
        throw new InternalServerError(null, "Fanpage not exist");
      }

      const memberIds = await this.fanPageRepo.getPageMemberIds(rs, campaign.pageId, memberUIDs);

      if (memberIds.length !== memberUIDs.length) {
        throw new InternalServerError(null, "Members does not match fully");
      }

      const response = rs.db.withTransaction<Campaign>(async () => {
        campaign.creatorId = userId;
        const newCampaign = await this.campaignRepo.create(rs, campaign);
        if (!newCampaign || !newCampaign.id) {
          throw new InternalServerError(null, "Fail to create campaign");
        }

        const linkMembers = await this.campaignRepo.linkMembers(
          rs,
          newCampaign.id,
          memberIds,
        );

        return newCampaign;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async startCampaign(rs: RequestScope, campaignId: number): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepo.getCampaignById(rs, campaignId);
      if (!campaign) {
        throw new InternalServerError(null, "Campaign not exist");
      }

      const userPlan = await this.userRepo.getUserInfoById(rs, rs.identity.getID());
      if (!userPlan) {
        throw new InternalServerError(null, "User Plan not found");
      }

      const members = await this.campaignRepo.getCampaignMembers(rs, campaignId);

      // check if user is enable to send such an amount messages
      if (userPlan.totalMessages !== PackageType.UnlimitedMessageAmount 
            && members.length > userPlan.totalMessages) {
        throw new InternalServerError(null, "Your account run out of budget")
      }

      const response = rs.db.withTransaction<Campaign>(async () => {
        const updatedCampaign = await this.campaignRepo.update(rs, {
          id: campaignId,
          status: CampaignStatus.Running,
          startedAt: new Date(),
        });
        return updatedCampaign;
      });


      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateSuccessPart(rs: RequestScope, campaignId: number, success: number): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepo.getCampaignById(rs, campaignId);
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
          updateCampaign["status"] = CampaignStatus.Completed;
          updateCampaign['updated_at'] = new Date();
        }

        const { successMessages, totalMessages } = await this.userRepo.getUserInfoById(rs, rs.identity.getID());
        await this.userRepo.updateUserPlan(rs, {
          userId: rs.identity.getID(),
          "successMessages": successMessages + success,
          "totalMessages": totalMessages != PackageType.UnlimitedMessageAmount ? totalMessages - success : totalMessages
        });

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
      const campaign = await this.campaignRepo.getCampaignById(rs, campaignId);

      if (!campaign.id) {
        throw new InternalServerError(null, "Campain does not exist");
      }

      const response = rs.db.withTransaction<Campaign>(async () => {
        const updateCampaign: CampaignUpdate = {
          id: campaignId,
          "status": CampaignStatus.Completed,
          updatedAt: new Date()
        }

        const updatedCampaign = await this.campaignRepo.update(rs, updateCampaign);
        return updatedCampaign;
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCampaignMembers(rs: RequestScope, campaignId: number): Promise<Member[]> {
    try {
      const campaign = await this.campaignRepo.getCampaignById(rs, campaignId);

      if (!campaign.id) {
        throw new InternalServerError(null, "Campain does not exist");
      }

      const members = await this.campaignRepo.getCampaignMembers(rs, campaignId);

      return members;
    } catch (error) {
      throw error;
    }
  }
}
