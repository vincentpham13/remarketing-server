// @ts-nocheck
import { Request, Response, NextFunction } from "express";
import { HttpErrorBase } from "@/utils/http";

export function ErrorMiddleware(
  error: HttpErrorBase,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpErrorBase) {
    // Remove debug info from response if env is production.
    if (process.env.NODE_ENV === "production") {
      delete error.debug;
    }

    res.setHeader("Content-Type", "application/problem+json");
    res.status(error.statusCode).json(error);
  }
}