import { RequestHandler } from 'express';
import cors from "cors";

export function CorsMiddleware(): RequestHandler {
  const whitelist = [
    "http://localhost:4000",
    "https://localhost:3000",
    "https://app.hana.ai",
    "https://app.bombot.vn",
    "https://remarketing-web.vercel.app",
    /chrome-extension:\/\/[\w]*/,
  ];

  const corsOptions: cors.CorsOptions = {
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Access-Token",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
      "Cookie",
      "Sec-Fetch-Site",
    ],
    credentials: true,
    origin: whitelist,
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"]
  };

  return cors(corsOptions);
}
