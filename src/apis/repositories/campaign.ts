import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { Campaign, CampaignUpdate } from '@/models/campaign';
import { Member } from '@/models/fanpage';

export interface ICampaignRepo {
  getAllByCreatorId(rs: RequestScope, creatorId: string): Promise<Campaign[]>;
  getCampaignById(rs: RequestScope, campaignId: number): Promise<Campaign>;
  getAllByPageId(rs: RequestScope, creatorId: string, pageId: string): Promise<Campaign[]>;
  create(rs: RequestScope, campaign: Campaign): Promise<Campaign>;
  linkMembers(rs: RequestScope, campaignId: number, memberIds: number[]): Promise<any[]>;
  update(rs: RequestScope, campaign: CampaignUpdate): Promise<Campaign>;
  getCampaignMembers(rs: RequestScope, campaignId: number): Promise<Member[]>;
}

@injectable()
export class CampaignRepo implements ICampaignRepo {
  async getAllByCreatorId(rs: RequestScope, creatorId: string): Promise<Campaign[]> {
    rs.db.prepare();
    const campaigns = await rs.db.queryBuilder
      .select(["c.*","p.name as page_name"])
      .from<Campaign>("campaign as c")
      .leftJoin("page as p", "p.id", "=", "c.page_id")
      .where("creator_id", creatorId);
    return campaigns;
  }

  async getCampaignById(rs: RequestScope, campaignId: number): Promise<Campaign> {
    rs.db.prepare();
    const campaign = await rs.db.queryBuilder
      .select(["campaign.*"])
      .from<Campaign>("campaign")
      .where("id", campaignId)
      // .where("creator_id", creatorId)
      .first();
    return campaign;
  }

  async getAllByPageId(rs: RequestScope, creatorId: string, pageId: string): Promise<Campaign[]> {
    rs.db.prepare();

    const campaigns = await rs.db.queryBuilder
      .select([
        "campaign.*",
        rs.db.client.raw(
          `array_agg(pm.uid) as member_UIDs`
        ),
      ])
      .from<Campaign>("campaign")
      .leftJoin("campaign_member as cm", "campaign.id", "=", "cm.campaign_id")
      .innerJoin("page_member as pm", "cm.page_member_id", "=", "pm.id")
      .where("creator_id", creatorId)
      .where("campaign.page_id", pageId)
      .groupBy("campaign.id");
    return campaigns;
  }

  async create(rs: RequestScope, campaign: Campaign): Promise<Campaign> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(campaign, "*")
      .into<Campaign>("campaign");

    return inserted;
  }

  async linkMembers(rs: RequestScope, campaignId: number, memberIds: number[]): Promise<any[]> {
    rs.db.prepare();

    const inserted = await rs.db.queryBuilder
      .insert(memberIds.map(id => ({
        campaignId,
        pageMemberId: id
      })), "page_member_id")
      .into<Campaign>("campaign_member");

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

  async getCampaignMembers(rs: RequestScope, campaignId: number): Promise<Member[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select("pm.*")
      .from<Member>("page_member as pm")
      .innerJoin("campaign_member as cp", "cp.page_member_id", "=", "pm.id")
      .where("cp.campaign_id", campaignId);
  }
}