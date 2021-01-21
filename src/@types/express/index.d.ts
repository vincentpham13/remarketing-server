import express from 'express';

declare global {
  namespace Express {
    export type PromiseMiddleware = (req: Request, res: Response) => Promise<any>;
    export interface Request {
      requestScope: import("../../apis/middlewares/Request").RequestScope;
      setRequestScope(rs: import("../../apis/middlewares/Request").RequestScope): void;
    }

    export interface Application {
      prefix(
        config: string | { path: string; middlewares?: any[] },
        callback?: any
      ): express.Application;
    }
  }
}