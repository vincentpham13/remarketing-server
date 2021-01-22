import { inject, injectable } from 'inversify';
import * as jwt from '@/utils/jwt';
import bcrypt from 'bcrypt';

import { UserIdentity } from '@/apis/middlewares';

import TYPES from '@/inversify/TYPES';
import { IUserRepo } from '../repositories/user';
import { RequestScope } from '@/models/request';

export interface IAuth {
  authenticate(rs: RequestScope, email: string, password: string): Promise<string>;
}

@injectable()
export class AuthService implements IAuth {
  @inject(TYPES.UserRepo)
  private userRepo: IUserRepo;

  async authenticate(rs: RequestScope, email: string, password: string): Promise<string> {
    console.log("🚀 ~ file: auth.ts ~ line 11 ~ AuthService ~ authenticate ~ username", email)
    try {
      const user = await this.userRepo.getUserByEmail(rs, email);
      if(!user) {
        throw new Error('User not found');
      }

      const valid = await bcrypt.compare(password, user?.password || '');
      if (!valid) {
        throw new Error('Email or password is not correct');
      }
      const accessToken = jwt.createJwtToken({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      return accessToken;
    } catch (error) {
      throw error;
    }
  }
}