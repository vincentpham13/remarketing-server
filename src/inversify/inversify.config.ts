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
const container = new Container();

container.bind<IAuth>(TYPES.AuthServiceImpl).to(AuthService).inSingletonScope();
container.bind<IUserRepo>(TYPES.UserRepo).to(UserRepo).inSingletonScope();

export default container;
