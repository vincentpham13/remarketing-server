import { injectable } from 'inversify';

import { User } from '@/models/user';
import { RequestScope } from '@/models/request';

export interface IUserRepo {
  getUserByEmail(rs: RequestScope, email: string): Promise<User | undefined>;
}

@injectable()
export class UserRepo implements IUserRepo {
  async getUserByEmail(rs: RequestScope, email: string): Promise<User | undefined> {
    rs.db.prepare();

    const user = await rs.db.queryBuilder
      .select("*")
      .from<User>("user")
      .where("email", email)
      .first();

    return user;
  }
}