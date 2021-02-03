import { injectable } from 'inversify';

import { User } from '@/models/user';
import { RequestScope } from '@/models/request';
import { FanPage, Member } from '@/models/fanpage';

export interface IFanPageRepo {
  getAll(rs: RequestScope): Promise<FanPage[]>;
  getAllByUserId(rs: RequestScope, userId: string): Promise<FanPage[]>;
  getOneByUserId(rs: RequestScope, userId: string, pageId: string): Promise<FanPage>;
  countPageByUser(rs: RequestScope, userId: string): Promise<any>;
  create(rs: RequestScope, userId: string, fanpage: FanPage): Promise<FanPage>;
  link(rs: RequestScope, userId: string, fanpageId: string): Promise<void>;
  importedMember(rs: RequestScope, member: Member): Promise<Member>;
  getMembers(rs: RequestScope, fanpageId: string): Promise<Member[]>;
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

  async countPageByUser(rs: RequestScope, userId: string): Promise<any>{
    rs.db.prepare();

    const result: any = await rs.db.queryBuilder
      .count('user_id',{ as: 'count'})
      .from<FanPage>("user_page")
      .where("user_id", userId)
      .first();
    return result.count;
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

  async importedMember(rs: RequestScope, member: Member): Promise<Member> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(member, "*")
      .into<Member>("page_member");
    return inserted;
  }

  async getMembers(rs: RequestScope, fanpageId: string): Promise<Member[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select("page_member.*")
      .from<Member>("page_member")
      .where("pageId", fanpageId)
  }
}
