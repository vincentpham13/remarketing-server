import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { User, UserInfo } from '@/models/user';


import { } from '@/utils/http';
import { IUserRepo } from '../repositories/user';
import { IFanPageRepo } from '../repositories/fanpage';
import { ICampaignRepo } from '../repositories/campaign';
import { IOrderRepo } from '../repositories/order';

export interface IUserService {
  getUserInfo(rs: RequestScope, userId: string): Promise<UserInfo>;
  getAllUsers(rs: RequestScope): Promise<User[]>;
  updateUserInfo(rs: RequestScope, user: User): Promise<User>;
  getUserDashboardInfo(rs: RequestScope, userId: string): Promise<any>;
}

@injectable()
export class UserService implements IUserService {
  @inject(TYPES.UserRepo)
  private userRepo: IUserRepo;
  @inject(TYPES.FanPageRepo)
  private fanpageRepo: IFanPageRepo;
  @inject(TYPES.CampaignRepo)
  private campaignRepo: ICampaignRepo;
  @inject(TYPES.OrderRepo)
  private orderRepo: IOrderRepo;

  async getUserInfo(rs: RequestScope, userId: string): Promise<UserInfo> {
    try {
      const user = await this.userRepo.getUserInfoById(rs, userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserDashboardInfo(rs: RequestScope, userId: string): Promise<any> {
    try{
        const pageCount = await this.fanpageRepo.countPageByUser(rs, userId);
        const userPlan = await this.userRepo.getUserPlanDetailById(rs, userId);
        const runningCampaign = await this.campaignRepo.countRunningCampaignByUserId(rs, userId);
        const completedCampaign = await this.campaignRepo.countCompletedCampaignByUserId(rs, userId);
        const recentCampaign = await this.campaignRepo.getAllByCreatorIdPaging(rs,userId, 5, 0);
        const recentOrder = await this.orderRepo.getOrdersByUserIdPaging(rs,userId, 5 , 0);

        return {
          pageCount,
          userPlan,
          runningCampaign,
          completedCampaign,
          recentCampaign,
          recentOrder
        }
    }catch(error){
      throw error;
    }
  }

  async getAllUsers(rs: RequestScope): Promise<User[]> {
    try {
      return await this.userRepo.getAllUsers(rs);
    } catch (error) {
      throw error;
    }
  }

  async updateUserInfo(rs: RequestScope, user: User): Promise<User> {
    try {
      return rs.db.withTransaction<User>(async () => {
        return await this.userRepo.updateUserInfo(rs, user);
      });
    } catch (error) {
      throw error;
    }
  }
}
