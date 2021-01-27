import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { User } from '@/models/user';


import { } from '@/utils/http';
import { IUserRepo } from '../repositories/user';

export interface IUserService {
  getUserInfo(rs: RequestScope, userId: string): Promise<any>;
  getAllUsers(rs: RequestScope): Promise<User[]>;
  updateUserInfo(rs: RequestScope, user: User): Promise<User>;
}

@injectable()
export class UserService implements IUserService {
  @inject(TYPES.UserRepo)
  private userRepo: IUserRepo;

  async getUserInfo(rs: RequestScope, userId: string): Promise<any> {
    try {
      const user = await this.userRepo.getUserInfoById(rs, userId);
      return user;
    } catch (error) {
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
      const updatedUser = await this.userRepo.updateUserInfo(rs, user);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}
