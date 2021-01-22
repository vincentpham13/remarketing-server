import { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

const urlencodedParser = bodyParser.urlencoded({ extended: false });

export function BodyParserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  urlencodedParser(req, res, next);
}
