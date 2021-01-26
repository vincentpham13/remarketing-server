import {inject, injectable} from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import {UserPlan} from '@/models/userPlan';

import {} from '@/utils/http';
import { IUserPlanRepo } from '../repositories/userPlan';

export interface IUserPlanService {
    getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan[]>;
    create(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>;
}

@injectable()
export class UserPlanService implements IUserPlanService {
    @inject(TYPES.UserPlanRepo) 
    private userPlanRepo: IUserPlanRepo;

    async getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan[]>{
        try{
            const userPlans = await this.userPlanRepo.getUserPlanById(rs, userId);
            return userPlans;
        }catch(error){
            throw error;
        }
    }

    async create(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>{
        try{
            const newUserPlan = await this.userPlanRepo.create(rs, userPlan);
            return newUserPlan;
        }catch(error){
            throw error;
        }
    }
}