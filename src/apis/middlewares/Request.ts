import { NextFunction, Request, Response, RequestHandler } from "express";
import db from "../../providers/db";
import { User } from '../../models/user';
import { RequestScope } from "@/models/request";

export interface Identity {
  getID(): string;
  getFullName(): string;
}

export class UserIdentity implements Identity {
  constructor(
    private id: string,
    private name: string,
    private email: string,
  ) {

  }

  getID(): string {
    return this.id;
  }

  getFullName(): string {
    return this.name;
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
