import { NextFunction, Request, Response, RequestHandler } from "express";

import * as jwt from '@/utils/jwt';
import db from '@/providers/db';
import { User } from "@/models/user";
import { UserIdentity } from "./request";
import { userInfo } from "os";

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
    console.log("🚀 ~ file: auth.ts ~ line 21 ~ decodedToken", decodedToken);
    const { email } = decodedToken;
    connection.prepare();
    const existingUser = await connection.queryBuilder
    .select("*")
    .from<User>("user")
    .where("email", email)
    .first();
    
    if(!existingUser) {
      throw new Error("This user does not exist in system.");
    }

    req.requestScope.identity = new UserIdentity(
      existingUser.id,
      existingUser.name,
      existingUser.email,
    );

    next();
  } catch (error) {
    res.status(400);
    next(new Error('Unauthorized request.'));
    return;
  }
};