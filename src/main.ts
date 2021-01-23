import "reflect-metadata";
import express, { Request, Response } from 'express';
import { InversifyExpressServer } from "inversify-express-utils";
import userAgent from 'express-useragent';
import knexLogger from "knex-logger";

import './apis/controllers';
import container from './inversify/inversify.config';

import {
  RequestMiddleware,
  CorsMiddleware,
  LoggerMiddleware,
  ErrorMiddleware,
  ResourceNotFoundMiddleware,
} from './apis/middlewares';
import db from "./providers/db";

async function bootstrap() {
  const app = express();
  const dbInstance = db.getInstance();
  dbInstance.connectDb();

  app.use(userAgent.express());
  app.use(LoggerMiddleware);

  app.use(CorsMiddleware());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(RequestMiddleware);

  app.use(knexLogger(dbInstance.connection));

  app.get('/healthcheck', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'Very good' });
  });


  const server = new InversifyExpressServer(container, null, {
    rootPath: '/api/v1'
  }, app);

  const appConfigured = server.build();
  app.use(ErrorMiddleware);
  app.use(ResourceNotFoundMiddleware);

  const serve = appConfigured.listen(process.env.PORT || 5000, () => `App running on`);
}

bootstrap();