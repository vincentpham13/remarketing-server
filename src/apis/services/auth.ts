import { inject, injectable } from 'inversify';
import * as jwt from '@/utils/jwt';
import bcrypt from 'bcrypt';

import { UserIdentity } from '@/apis/middlewares';

import TYPES from '@/inversify/TYPES';
import { IUserRepo } from '../repositories/user';
import { RequestScope } from '@/models/request';
import { InternalServerError, Unauthorized } from '@/utils/http';
import fb from '@/utils/fb';
import { IFanPageRepo } from '../repositories/fanpage';
import moment from 'moment';
import { IPackageRepo } from '../repositories/package';
import { Package } from '@/enums/package';
export interface IAuth {
  authenticate(rs: RequestScope, email: string, password: string): Promise<any>;
  authenticateFB(rs: RequestScope, fbUserId: string, accessToken: string): Promise<any>;
  refreshToken(rs: RequestScope, userId: string): Promise<any>;
  logout(rs: RequestScope): Promise<void>;
}

@injectable()
export class AuthService implements IAuth {
  constructor(
    @inject(TYPES.UserRepo)
    private userRepo: IUserRepo,
    @inject(TYPES.FanPageRepo)
    private fanPageRepo: IFanPageRepo,
    @inject(TYPES.PackageRepo)
    private packageRepo: IPackageRepo,
  ) {

  }

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
          roleId: user.roleId,
          phone: user.phone,
          job: user.job,
        };

        const [accessToken, refreshToken] = jwt.createAccessToken(userResponse);

        await this.userRepo.updateUserToken(rs, user.id, accessToken);

        return {
          accessToken,
          refreshToken,
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
        const json = await fb.getUserInfo(fbUserId, fbAcessToken);
        const { data, name, id } = json;
        if (data?.error) throw new Unauthorized(data.error.message, "No data");

        if (id !== fbUserId) {
          throw new InternalServerError(null, "UID does not match");
        }

        let user = await this.userRepo.getUserInfoById(rs, fbUserId);
        if (!user) {
          // create new user account

          user = await this.userRepo.createUser(rs, {
            id: fbUserId,
            name: name,
            roleId: 1,
          })
          const freePackage = await this.packageRepo.getPackageById(rs, Package.Free);

          if (!freePackage) {
            throw new InternalServerError(null, "Free package not exist");
          }
          const duration  = freePackage.dayDuration !== null 
            ? moment().add(freePackage.dayDuration, 'days').toDate()
            : moment().add(freePackage.monthDuration, 'months').toDate()
          await this.userRepo.createUserPlan(rs, {
            userId: fbUserId,
            packageId: freePackage.id,
            totalMessages: freePackage.messageAmount * 1000, 
            successMessages: 0,
            validTo: duration
          });
        }

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          phone: user.phone,
          job: user.job,
        };

        const [accessToken, refreshToken] = jwt.createAccessToken(userResponse);

        await this.userRepo.updateUserToken(rs, user.id, accessToken);

        // Get all fanpages from DB
        const allFanPageIds = (await this.fanPageRepo.getAll(rs)).map(m => m.id);
        const myFanPageIds = (await this.fanPageRepo.getAllByUserId(rs, user.id)).map(m => m.id);

        // Get all fanpages from fb api
        const fanPages = await fb.getUserFanPages(fbAcessToken);

        const fanPagePromises = fanPages
          .filter(f => !allFanPageIds.includes(f.id))
          .map(fanpage => this.fanPageRepo.create(rs, user.id, fanpage));

        if (fanPagePromises.length) {
          Promise.resolve(fanPagePromises);
        }

        const linkUserFanPagePromises = fanPages
          .filter(f => !myFanPageIds.includes(f.id))
          .map(fanpage => this.fanPageRepo.link(rs, user.id, fanpage.id));

        if (linkUserFanPagePromises.length) {
          Promise.resolve(linkUserFanPagePromises);
        }

        return {
          accessToken,
          refreshToken,
          user: userResponse,
        };
      })

      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(rs: RequestScope, userId: string): Promise<any> {
    try {
      const response = rs.db.withTransaction<any>(async () => {
        const user = await this.userRepo.getUserInfoById(rs, userId);
        if (!user) {
          throw new Error('User not found');
        }

        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId
        };

        const [accessToken, refreshToken] = jwt.createAccessToken(userResponse);

        await this.userRepo.updateUserToken(rs, user.id, accessToken);

        return {
          accessToken,
          refreshToken,
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