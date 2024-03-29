import { injectable } from 'inversify';

import { User, UserInfo, UserPlan, UserPlanUpdate } from '@/models/user';
import { RequestScope } from '@/models/request';
import { UserRole } from '@/enums/userRole';

export interface IUserRepo {
  getAllUsers(rs: RequestScope): Promise<User[]>;
  getUserInfoById(rs: RequestScope, id: string): Promise<UserInfo>;
  getUserByEmail(rs: RequestScope, email: string): Promise<User>;
  updateUserToken(rs: RequestScope, userId: string, token: string): Promise<User>;
  createUser(rs: RequestScope, user: User): Promise<User>;
  updateUserInfo(rs: RequestScope, user: User): Promise<User>;

  getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan>;
  createUserPlan(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan>;
  updateUserPlan(rs: RequestScope, userPlan: UserPlanUpdate): Promise<UserPlan>;
}

@injectable()
export class UserRepo implements IUserRepo {
  async getAllUsers(rs: RequestScope): Promise<User[]> {
    rs.db.prepare();

    const users = await rs.db.queryBuilder
      .select([
        "u.id",
        "u.name",
        "u.email",
        "u.phone",
        "u.role_id",
        "u.job",
      ])
      .from<User>("user as u")
      .where("u.role_id", UserRole.FBUser)
    return users;
  }

  async getUserInfoById(rs: RequestScope, id: string): Promise<UserInfo> {
    rs.db.prepare();

    const user = await rs.db.queryBuilder
      .select([
        "u.id as id",
        "u.name",
        "u.email",
        "u.phone",
        "u.role_id",
        "u.job",
        "u.city",
        "u.company_name",
        "upl.total_messages",
        "upl.success_messages",
        "upl.valid_to",
        "p.id as package_id",
        "p.label as package_name",
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

  async updateUserInfo(rs: RequestScope, user: User): Promise<User> {
    rs.db.prepare();
    const [updated] = await rs.db.queryBuilder
      .update(user)
      .into<User>("user")
      .returning("*")
      .where("id", user.id);
    return updated;
  }

  async getUserPlanById(rs: RequestScope, userId: string): Promise<UserPlan> {
    rs.db.prepare();
    const userPlan = await rs.db.queryBuilder
      .select(["user_plan.*"])
      .from<UserPlan>("user_plan")
      .where("user_id", userId)
      .first();
    return userPlan;
  }

  async createUserPlan(rs: RequestScope, userPlan: UserPlan): Promise<UserPlan> {
    rs.db.prepare();
    const [inserted] = await rs.db.queryBuilder
      .insert(userPlan, "*")
      .into<UserPlan>("user_plan");
    return inserted;
  }

  async updateUserPlan(rs: RequestScope, userPlan: UserPlanUpdate): Promise<UserPlan> {
    rs.db.prepare();

    const [updated] = await rs.db.queryBuilder
      .update(userPlan)
      .into<UserPlan>("user_plan")
      .returning("*")
      .where("user_id", userPlan.userId);

    return updated;
  }
}