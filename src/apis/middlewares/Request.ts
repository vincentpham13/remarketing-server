import { NextFunction, Request, Response, RequestHandler } from "express";
import db, { Executor } from "../../providers/db";
import { User } from '../../models/user';

interface Identity {
  getID(): string;
  getFullName(): string;
}

class UserIdentity implements Identity {
  constructor(private user: User) {

  }

  getID(): string {
    return this.user.id;
  }

  getFullName(): string {
    return this.user.name;
  }
}

export class RequestScope {

  constructor(
    private _db: Executor,
    private _time: Date
  ) {

  }

  get db(): Executor {
    return this._db;
  }

  get time(): Date {
    return this._time;
  }
}

const dbInstance = db.getInstance();
dbInstance.connectDb();
const executor = dbInstance.connection;

export const RequestMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const requestScope = new RequestScope(executor, new Date());

  req.requestScope = requestScope;
  req.setRequestScope = (rs: RequestScope): void => {
    req.requestScope = rs;
  };

  res.setHeader('Content-Type', 'application/json');

  next();
};
