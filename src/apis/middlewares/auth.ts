import { NextFunction, Request, Response, RequestHandler } from "express";

import * as jwt from '@/utils/jwt';
import db from '@/providers/db';
import { User } from "@/models/user";
import { UserIdentity } from "./request";
import { userInfo } from "os";
import { Unauthorized } from "@/utils/http";

const { connection } = db.getInstance();

export const AuthMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bearerToken = req.header("Authorization");

    if (!bearerToken) {
      throw new Error("Empty token.");
    }

    const parts = bearerToken.split(" ");
    const token = parts[1] || parts[0];

    const decodedToken = jwt.verifyJwtToken(token);
    const { email } = decodedToken;
    connection.prepare();
    const existingUser = await connection.queryBuilder
      .select("*")
      .from<User>("user")
      .where("email", email)
      .first();

    if (!existingUser) {
      throw new Error("This user does not exist in system.");
    }

    if (token !== existingUser?.token) {
      throw new Error("Token was expired");
    }

    req.requestScope.identity = new UserIdentity(
      existingUser.id,
      existingUser.name,
      (existingUser.roleId as number),
      existingUser.email,
    );

    next();
  } catch (error) {
    res.status(401);
    res.setHeader('Content-Type', 'application/json');
    next(new Unauthorized(error, 'Unauthorized request.'));
    return;
  }
};