import { RequestScope } from '@/models/request';
import { UserPlan } from '@/models/userPlan';
import { injectable } from 'inversify';
 
export interface IUserPlanRepo {
    getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan[]>;
    create(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>;
}

@injectable()
export class UserPlanRepo implements IUserPlanRepo{
    async getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan[]>{
        rs.db.prepare();
        const userPlans = await rs.db.queryBuilder
            .select(["user_plan.*"])
            .from<UserPlan>("user_plan")
            .where("user_plan.user_id", userId);
        return userPlans;
    }

    async create(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>{
        rs.db.prepare();
        const [inserted] = await rs.db.queryBuilder
            .insert(userPlan,"*")
            .into<UserPlan>("user_plan");
        return inserted;
    }
}