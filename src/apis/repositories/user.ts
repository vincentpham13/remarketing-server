import { injectable } from 'inversify';

import { User, UserPlan } from '@/models/user';
import { RequestScope } from '@/models/request';

export interface IUserRepo {
  getUserInfoById(rs: RequestScope, id: string): Promise<any>;
  getUserByEmail(rs: RequestScope, email: string): Promise<User>;
  updateUserToken(rs: RequestScope, userId: string, token: string): Promise<User>;
  createUser(rs: RequestScope, user: User): Promise<User>;
  updateUserInfo(rs: RequestScope, user: User): Promise<User>;

  getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan[]>;
  createUserPlan(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>;
}

@injectable()
export class UserRepo implements IUserRepo {
  async getUserInfoById(rs: RequestScope, id: string): Promise<any> {
    rs.db.prepare();

    const user = await rs.db.queryBuilder
      .select([
        "u.id",
        "u.name",
        "u.email",
        "u.phone",
        "u.role_id",
        "u.job",
        "upl.total_messages",
        "upl.success_messages",
        "upl.valid_to",
        "p.label", 
        "p.message_amount",
      ])
      .from<User>("user as u")
      .leftJoin("user_plan as upl", "upl.user_id", "=", "u.id")
      .leftJoin("package as p", "p.id", "=", "upl.package_id")
      .where("u.id", id)
      .first();
    return user;
  }

  async getUserByEmail(rs: RequestScope, email: string): Promise<User> {
    rs.db.prepare();

    const user = await rs.db.queryBuilder
      .select("*")
      .from<User>("user")
      .where("email", email)
      .first();

    return user as User;
  }

  async updateUserToken(rs: RequestScope, userId: string, token: string): Promise<User> {
    rs.db.prepare();
    const [updated] = await rs.db.queryBuilder
      .update("token", token)
      .into<User>("user")
      .returning("*")
      .where({ id: userId });

    return updated;
  }

  async createUser(rs: RequestScope, user: User): Promise<User> {
    rs.db.prepare();
    const [inserted] = await rs.db.queryBuilder
      .insert(user, "*")
      .into<User>("user");

    return inserted;
  }

  async updateUserInfo(rs: RequestScope, user: User): Promise<User>{
    rs.db.prepare();
    const [updated] = await rs.db.queryBuilder
      .update(user)
      .into<User>("user")
      .returning("*")
      .where("id", user.id);
      return updated;
  }

  async getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan[]>{
    rs.db.prepare();
    const userPlans = await rs.db.queryBuilder
        .select(["user_plan.*"])
        .from<UserPlan>("user_plan")
        .where("user_plan.user_id", userId);
    return userPlans;
  }

  async createUserPlan(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>{
      rs.db.prepare();
      const [inserted] = await rs.db.queryBuilder
          .insert(userPlan,"*")
          .into<UserPlan>("user_plan");
      return inserted;
  }
}