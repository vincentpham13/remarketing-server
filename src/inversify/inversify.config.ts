import { Container } from 'inversify';
import { interfaces, TYPE } from 'inversify-express-utils';

import TYPES from './TYPES';
import {
  IAuth,
  AuthService
} from '../apis/services/auth';
const container = new Container();

container.bind<IAuth>(TYPES.AuthServiceImpl).to(AuthService).inSingletonScope();

export default container;
