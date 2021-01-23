import { injectable } from 'inversify';

import { RequestScope } from '@/models/request';
import { Campaign } from '@/models/campaign';

export interface ICampaignRepo {
    getAll(rs: RequestScope): Promise<Campaign[]>;
    getAllByPageId(rs: RequestScope, pageId: string): Promise<Campaign[]>;
    create(rs: RequestScope, campaign: Campaign): Promise<Campaign>;
}

@injectable()
export class CampaignRepo implements ICampaignRepo{
    async getAll(rs: RequestScope): Promise<Campaign[]>{
        rs.db.prepare();
        const campaigns = await rs.db.queryBuilder
            .select(["campaign.*"])
            .from<Campaign>("campaign");
        return campaigns;
    }

    async getAllByPageId(rs: RequestScope, pageId: string): Promise<Campaign[]>{
        rs.db.prepare();

        const campaigns = await rs.db.queryBuilder
          .select(["campaign.*"])
          .from<Campaign>("campaign")
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
}