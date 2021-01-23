import { Container } from 'inversify';
import { interfaces, TYPE } from 'inversify-express-utils';

import TYPES from './TYPES';
import {
  IAuth,
  AuthService
} from '../apis/services/auth';
import {
  IUserRepo,
  UserRepo
} from '@/apis/repositories/user';
import { FanPageService, IFanPageService } from '@/apis/services/fanpage';
import { FanPageRepo, IFanPageRepo } from '@/apis/repositories/fanpage';
import { CampaignRepo, ICampaignRepo } from '@/apis/repositories/campaign';
import { CampaignService, ICampaignService } from '@/apis/services/campaign';

const container = new Container();

// auth
container.bind<IAuth>(TYPES.AuthServiceImpl).to(AuthService).inSingletonScope();
container.bind<IUserRepo>(TYPES.UserRepo).to(UserRepo).inSingletonScope();

// fanpage
container.bind<IFanPageRepo>(TYPES.FanPageRepo).to(FanPageRepo).inSingletonScope();
container.bind<IFanPageService>(TYPES.FanPageService).to(FanPageService).inSingletonScope();

// comapaign
container.bind<ICampaignRepo>(TYPES.CampaignRepo).to(CampaignRepo).inSingletonScope();
container.bind<ICampaignService>(TYPES.CampaignService).to(CampaignService).inSingletonScope();

export default container;
