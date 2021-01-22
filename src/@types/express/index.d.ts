import express from 'express';

declare global {
  namespace Express {
    export type PromiseMiddleware = (req: Request, res: Response) => Promise<any>;
    export interface Request {
      requestScope: import("../../apis/middlewares/request").RequestScope;
      setRequestScope(rs: import("../../apis/middlewares/request").RequestScope): void;
    }

    export interface Application {
      prefix(
        config: string | { path: string; middlewares?: any[] },
        callback?: any
      ): express.Application;
    }
  }
}