import { inject, injectable } from 'inversify';
import * as jwt from '@/utils/jwt';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

import { UserIdentity } from '@/apis/middlewares';

import TYPES from '@/inversify/TYPES';
import { IUserRepo } from '../repositories/user';
import { RequestScope } from '@/models/request';
import { InternalServerError, Unauthorized } from '@/utils/http';

export interface IAuth {
  authenticate(rs: RequestScope, email: string, password: string): Promise<any>;
  authenticateFB(rs: RequestScope, fbUserId: string, accessToken: string): Promise<any>;
  refreshToken(rs: RequestScope): Promise<any>;
  logout(rs: RequestScope): Promise<void>;
}

@injectable()
export class AuthService implements IAuth {
  @inject(TYPES.UserRepo)
  private userRepo: IUserRepo;

  async authenticate(rs: RequestScope, email: string, password: string): Promise<any> {
    try {
      const token = rs.db.withTransaction<any>(async () => {
        const user = await this.userRepo.getUserByEmail(rs, email);
        if (!user) {
          throw new Error('User not found');
        }

        const valid = await bcrypt.compare(password, user?.password || '');
        if (!valid) {
          throw new Error('Email or password is not correct');
        }

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId
        };

        const [accessToken] = jwt.createAccessToken(userResponse);

        await this.userRepo.updateUserToken(rs, user.id, accessToken);

        return {
          accessToken,
          user: userResponse,
        };
      })

      return token;
    } catch (error) {
      throw error;
    }
  }

  async authenticateFB(rs: RequestScope, fbUserId: string, fbAcessToken: string): Promise<any> {
    try {
      const response = rs.db.withTransaction<any>(async () => {
        const response = await fetch(
          `https://graph.facebook.com/v9.0/${fbUserId}?fields=id,email,name&access_token=${fbAcessToken}`,
          {
            method: 'GET'
          });

        const json = await response.json();
        const { data, name, id } = json;
        if (data?.error) throw new Unauthorized(data.error.message, "No data");

        if (id !== fbUserId) {
          throw new InternalServerError(null, "UID does not match");
        }

        let user = await this.userRepo.getUserById(rs, fbUserId);
        if (!user) {
          // create new user account

          user = await this.userRepo.createUser(rs, {
            id: fbUserId,
            name: name,
            roleId: 1,
          })
        }

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId
        };

        const [accessToken] = jwt.createAccessToken(userResponse);

        await this.userRepo.updateUserToken(rs, user.id, accessToken);

        return {
          accessToken,
          user: userResponse,
        };
      })

      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(rs: RequestScope): Promise<any> {
    try {
      const response = rs.db.withTransaction<any>(async () => {
        const user = await this.userRepo.getUserById(rs, rs.identity.getID());
        if (!user) {
          throw new Error('User not found');
        }

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId
        };

        const [accessToken] = jwt.createAccessToken(userResponse);

        await this.userRepo.updateUserToken(rs, user.id, accessToken);

        return {
          accessToken,
          user: userResponse,
        };
      })

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(rs: RequestScope): Promise<void> {
    try {
      rs.db.withTransaction<any>(async () => {
        const user = rs.identity;
        if (!user) {
          throw new Error('User not found');
        }

        await this.userRepo.updateUserToken(rs, user.getID(), '');
      })
    } catch (error) {
      throw error;
    }
  }
}