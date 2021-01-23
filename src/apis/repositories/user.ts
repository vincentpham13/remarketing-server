import { injectable } from 'inversify';

import { User } from '@/models/user';
import { RequestScope } from '@/models/request';

export interface IUserRepo {
  getUserById(rs: RequestScope, id: string): Promise<User | undefined>;
  getUserByEmail(rs: RequestScope, email: string): Promise<User | undefined>;
  updateUserToken(rs: RequestScope, userId: string, token: string): Promise<User>;
  createUser(rs: RequestScope, user: User): Promise<User>;
}

@injectable()
export class UserRepo implements IUserRepo {
  async getUserById(rs: RequestScope, id: string): Promise<User | undefined> {
    rs.db.prepare();

    const user = await rs.db.queryBuilder
      .select("*")
      .from<User>("user")
      .where("id", id)
      .first();

    return user;
  }

  async getUserByEmail(rs: RequestScope, email: string): Promise<User | undefined> {
    rs.db.prepare();

    const user = await rs.db.queryBuilder
      .select("*")
      .from<User>("user")
      .where("email", email)
      .first();

    return user;
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
    rs.db.prepare();
    const [inserted] = await rs.db.queryBuilder
      .insert(user, "*")
      .into<User>("user");

    return inserted;
  }
}