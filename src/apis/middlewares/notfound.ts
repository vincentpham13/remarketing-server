import { Request, Response, NextFunction } from "express";
import { ResourceNotFound } from "@/utils/http";

export function ResourceNotFoundMiddleware(
  _req: Request,
  res: Response,
  _next: NextFunction
): any {
  return res
    .status(404)
    .json(
      new ResourceNotFound(
        null,
        "Resource not found",
        "This resource does not exist in system."
      )
    );
}
