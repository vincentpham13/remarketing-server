import { injectable } from 'inversify';

export interface IAuth {
  login(): void;
}

@injectable()
export class AuthService implements IAuth {
  login(): void {
    console.log('Dop authentication here');
  }
}