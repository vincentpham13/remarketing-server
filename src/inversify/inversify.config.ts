import { Container } from 'inversify';
import { interfaces, TYPE } from 'inversify-express-utils';

import TYPES from './TYPES';
import {
  IAuth,
  AuthService
} from '../apis/services/auth';
import { FanPageService, IFanPageService } from '@/apis/services/fanpage';
import { FanPageRepo, IFanPageRepo } from '@/apis/repositories/fanpage';
import { CampaignRepo, ICampaignRepo } from '@/apis/repositories/campaign';
import { CampaignService, ICampaignService } from '@/apis/services/campaign';
import { IUserRepo,UserRepo } from '@/apis/repositories/user';

import { IUserService, UserService } from '@/apis/services/user';
import { IPackageRepo, PackageRepo } from '@/apis/repositories/package';
import { IPackageService, PackageService } from '@/apis/services/package';
import { IOrderRepo, OrderRepo } from '@/apis/repositories/order';
import { IOrderService, OrderService } from '@/apis/services/order';

const container = new Container();

// auth
container.bind<IAuth>(TYPES.AuthServiceImpl).to(AuthService).inSingletonScope();

// fanpage
container.bind<IFanPageRepo>(TYPES.FanPageRepo).to(FanPageRepo).inSingletonScope();
container.bind<IFanPageService>(TYPES.FanPageService).to(FanPageService).inSingletonScope();

// comapaign
container.bind<ICampaignRepo>(TYPES.CampaignRepo).to(CampaignRepo).inSingletonScope();
container.bind<ICampaignService>(TYPES.CampaignService).to(CampaignService).inSingletonScope();

// user
container.bind<IUserRepo>(TYPES.UserRepo).to(UserRepo).inSingletonScope();
container.bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();

// package
container.bind<IPackageRepo>(TYPES.PackageRepo).to(PackageRepo).inSingletonScope();
container.bind<IPackageService>(TYPES.PackageService).to(PackageService).inSingletonScope();

// order
container.bind<IOrderRepo>(TYPES.OrderRepo).to(OrderRepo).inSingletonScope();
container.bind<IOrderService>(TYPES.OrderService).to(OrderService).inSingletonScope();

export default container;
