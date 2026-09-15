import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utilis/catchAsync";
import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utilis/jwt";
import { prisma } from "../lib/prisma";
import config from "../config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        role: string;
        id: Role;
      };
    }
  }
}
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not logged in. Please log in to access this resource.",
      );
    }

    const verifyToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifyToken.success) {
      throw new Error(verifyToken.message);
    }

    const { email, name, id, role } = verifyToken.data as JwtPayload;

    if (!requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden. you  don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });
    if (!user) {
      throw new Error("user not found. please log in again");
    }

    if (user.activestatus === "BLOCKED") {
      throw new Error("Your account has been blocked. please contact support.");
    }
    req.user = {
      email,
      name,
      id,
      role,
    };
    next();
  });
};
