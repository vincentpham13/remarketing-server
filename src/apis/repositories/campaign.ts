import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { Campaign, CampaignUpdate } from '@/models/campaign';

export interface ICampaignRepo {
  getAllByCreatorId(rs: RequestScope, creatorId: string): Promise<Campaign[]>;
  getCampaignById(rs: RequestScope, campaignId: number): Promise<Campaign>;
  getAllByCreatorIdPaging(rs: RequestScope, creatorId: string, limit: number, offset: number, orderByRaw?: string): Promise<Campaign[]>;
  countRunningCampaignByUserId(rs: RequestScope, userId: string): Promise<any>;
  countCompletedCampaignByUserId(rs: RequestScope, userId: string): Promise<any>;
  getAllByPageId(rs: RequestScope, creatorId: string, pageId: string): Promise<Campaign[]>;
  create(rs: RequestScope, campaign: Campaign): Promise<Campaign>;
  update(rs: RequestScope, campaign: CampaignUpdate): Promise<Campaign>;
}

@injectable()
export class CampaignRepo implements ICampaignRepo {
  async getAllByCreatorId(rs: RequestScope, creatorId: string): Promise<Campaign[]> {
    rs.db.prepare();
    const campaigns = await rs.db.queryBuilder
      .select(["campaign.*"])
      .from<Campaign>("campaign")
      .where("creator_id", creatorId);
    return campaigns;
  }
  
  async getAllByCreatorIdPaging(rs: RequestScope, creatorId: string, limit: number, offset: number, orderByRaw?: string): Promise<Campaign[]> {
    rs.db.prepare();
    const campaigns = await rs.db.queryBuilder
      .select(["campaign.*"])
      .from<Campaign>("campaign")
      .where("creator_id", creatorId)
      .limit(limit)
      .offset(offset)
      .orderByRaw(orderByRaw ? orderByRaw : 'created_at DESC');
    return campaigns;
  }

  async countRunningCampaignByUserId(rs: RequestScope, userId: string): Promise<any> {
    rs.db.prepare();

    const result: any = await rs.db.queryBuilder
      .count('id',{ as: 'count'})
      .from<Campaign>("campaign")
      .where("status", 'running')
      .where("creator_id", userId)
      .first();
    return result.count;
  }

  async countCompletedCampaignByUserId(rs: RequestScope, userId: string): Promise<any> {
    rs.db.prepare();
    const result: any = await rs.db.queryBuilder
      .count('id',{ as: 'count'})
      .from<Campaign>("campaign")
      .where("status", 'completed')
      .where("creator_id", userId)
      .first();
    return result.count;
  }

  async getCampaignById(rs: RequestScope, campaignId: number): Promise<Campaign> {
    rs.db.prepare();
    const campaign = await rs.db.queryBuilder
      .select(["campaign.*"])
      .from<Campaign>("campaign")
      .where("id", campaignId)
      .where("creator_id", creatorId)
      .first();
    return campaign;
  }

  async getAllByPageId(rs: RequestScope, creatorId: string, pageId: string): Promise<Campaign[]> {
    rs.db.prepare();

    const campaigns = await rs.db.queryBuilder
      .select(["campaign.*"])
      .from<Campaign>("campaign")
      .where("creator_id", creatorId)
      .where("page_id", pageId);
    return campaigns;
  }

  async create(rs: RequestScope, campaign: Campaign): Promise<Campaign> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(campaign, "*")
      .into<Campaign>("campaign");

    return inserted;
  }

  async update(rs: RequestScope, campaign: CampaignUpdate): Promise<Campaign> {
    rs.db.prepare();

    const [updated] = await rs.db.queryBuilder
      .update(campaign)
      .into<Campaign>("campaign")
      .returning("*")
      .where("id", campaign.id);

    return updated;
  }
}