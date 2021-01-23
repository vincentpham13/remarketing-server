import { inject, injectable } from 'inversify';
import * as jwt from '@/utils/jwt';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

import { UserIdentity } from '@/apis/middlewares';

import TYPES from '@/inversify/TYPES';
import { IUserRepo } from '../repositories/user';
import { RequestScope } from '@/models/request';
import { IFanPageRepo } from '../repositories/fanpage';
import { FanPage } from '@/models/fanpage';

export interface IFanPageService {
  getAll(rs: RequestScope): Promise<any[]>;
  getOne(rs: RequestScope, pageId: string): Promise<any>;
  create(rs: RequestScope, fanpage: FanPage): Promise<FanPage>;
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

  async create(rs: RequestScope, fanpage: FanPage): Promise<FanPage> {
    throw new Error('Method not implemented.');
  }
}