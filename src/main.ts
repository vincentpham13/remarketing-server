import "reflect-metadata";
import express, { Request, Response } from 'express';
import { InversifyExpressServer } from "inversify-express-utils";

import './apis/controllers/auth';
import container from './inversify/inversify.config';

import {
  RequestMiddleware,
  CorsMiddleware,
  LoggerMiddleware
} from './apis/middlewares';

async function bootstrap() {
  const app = express();

  app.use([
    RequestMiddleware,
    CorsMiddleware(),
    LoggerMiddleware
  ]);

  app.get('/healthcheck', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'Very good' });
  });

  const server = new InversifyExpressServer(container, null, {
    rootPath: '/api/v1'
  }, app);


  const appConfigured = server.build();
  const serve = appConfigured.listen(process.env.PORT || 5000, () => `App running on`);
}

bootstrap();

// logger
// cors middleware
// body parser middleware
// Dockerfile
// inversify DI
// migration knex