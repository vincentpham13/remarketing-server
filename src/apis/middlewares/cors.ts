import { RequestHandler } from 'express';
import cors from "cors";

export function CorsMiddleware(): RequestHandler {
  const whitelist = ["http://localhost:4000"];

  const corsOptions: cors.CorsOptions = {
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Access-Token",
      "Access-Control-Allow-Origin"
    ],
    origin: '*',
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"]
  };

  return cors(corsOptions);
}
