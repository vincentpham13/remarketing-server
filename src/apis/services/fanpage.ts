import { inject, injectable } from 'inversify';
import * as jwt from '@/utils/jwt';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

import { UserIdentity } from '@/apis/middlewares';

import TYPES from '@/inversify/TYPES';
import { IUserRepo } from '../repositories/user';
import { RequestScope } from '@/models/request';
import { IFanPageRepo } from '../repositories/fanpage';
import { FanPage, Member } from '@/models/fanpage';

export interface IFanPageService {
  getAll(rs: RequestScope): Promise<any[]>;
  getOne(rs: RequestScope, pageId: string): Promise<any>;
  importMembers(rs: RequestScope, fanpageId: string, member: { uid: string; name: string }[]): Promise<any>;
  getMembers(rs: RequestScope, fanpageId: string): Promise<Member[]>;
}

@injectable()
export class FanPageService implements IFanPageService {
  @inject(TYPES.FanPageRepo)
  private fanPageRepo: IFanPageRepo;


  async getAll(rs: RequestScope): Promise<any[]> {
    try {
      const fanpages = await this.fanPageRepo.getAllByUserId(rs, rs.identity.getID());
      return fanpages;
    } catch (error) {
      throw error;
    }
  }

  async getOne(rs: RequestScope, pageId: string): Promise<any> {
    try {
      const fanpage = await this.fanPageRepo.getOneByUserId(rs, rs.identity.getID(), pageId);
      return fanpage;
    } catch (error) {
      throw error;
    }
  }

  async importMembers(rs: RequestScope, fanpageId: string, members: { uid: string; name: string }[]): Promise<any> {
    try {
      return rs.db.withTransaction(async () => {
        const createMemberPromises = members.map(member => {
          return this.fanPageRepo.importedMember(rs, {
            uid: member.uid,
            name: member.name,
            pageId: fanpageId,
          });
        });
        return await Promise.all(createMemberPromises);
      });
    } catch (error) {
      throw error;
    }
  }

  async getMembers(rs: RequestScope, fanpageId: string): Promise<Member[]> {
    try {
      return this.fanPageRepo.getMembers(rs, fanpageId);

    } catch (error) {
      throw error;
    }
  }
}