import { injectable } from 'inversify';

import { User } from '@/models/user';
import { RequestScope } from '@/models/request';
import { FanPage } from '@/models/fanpage';

export interface IFanPageRepo {
  getAll(rs: RequestScope): Promise<FanPage[]>;
  getAllByUserId(rs: RequestScope, userId: string): Promise<FanPage[]>;
  getOneByUserId(rs: RequestScope, userId: string, pageId: string): Promise<FanPage>;
  create(rs: RequestScope, userId: string, fanpage: FanPage): Promise<FanPage>;
  link(rs: RequestScope, userId: string, fanpageId: string): Promise<void>;
}

@injectable()
export class FanPageRepo implements IFanPageRepo {
  async getAll(rs: RequestScope): Promise<FanPage[]> {
    rs.db.prepare();

    const fanpages = await rs.db.queryBuilder
      .select(["page.*"])
      .from<FanPage>("page")
    return fanpages;
  }

  async getAllByUserId(rs: RequestScope, userId: string): Promise<FanPage[]> {
    rs.db.prepare();

    const fanpages = await rs.db.queryBuilder
      .select(["page.*"])
      .from<FanPage>("page")
      .innerJoin("user_page as up", "up.page_id", "=", "page.id")
      .innerJoin<User>("user", "up.user_id", "=", "user.id")
      .where("user.id", userId);
    return fanpages;
  }

  async getOneByUserId(rs: RequestScope, userId: string, pageId: string): Promise<FanPage> {
    rs.db.prepare();

    const fanpage = await rs.db.queryBuilder
      .select("page.*")
      .from<User>("user")
      .innerJoin("user_page as up", "user.id", "=", "up.user_id")
      .innerJoin<FanPage>("page", "page.id", "=", "up.page_id")
      .where("user.id", userId)
      .where("page.id", pageId)
      .first();
    return fanpage;
  }

  async create(rs: RequestScope, userId: string, fanpage: FanPage): Promise<FanPage> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(fanpage, "*")
      .into<FanPage>("page");

    return inserted;
  }

  async link(rs: RequestScope, userId: string, fanpageId: string): Promise<void> {
    rs.db.prepare();

    await rs.db.queryBuilder
      .insert({
        userId: userId,
        pageId: fanpageId,
      }, "*")
      .into("user_page");
  }
}