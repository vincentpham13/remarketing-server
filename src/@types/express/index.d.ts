import { RequestScope } from '@/models/request';
import express from 'express';

declare global {
  namespace Express {
    export type PromiseMiddleware = (req: Request, res: Response) => Promise<any>;
    export interface Request {
      requestScope: RequestScope;
      setRequestScope(rs: RequestScope): void;
    }

    export interface Application {
      prefix(
        config: string | { path: string; middlewares?: any[] },
        callback?: any
      ): express.Application;
    }
  }
}