import { NextFunction, Request, Response, Router } from "express";
import { auth } from "../../middleware/auth";
import { Role, subscriptionStatus } from "../../../generated/prisma/enums";
import { premiumController } from "./premium.controller";
import { catchAsync } from "../../utilis/catchAsync";
import { prisma } from "../../lib/prisma";
import { subscriptionGuard } from "../../middleware/premiumGuard";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  subscriptionGuard(),
  premiumController.premiumContent,
);

export const premiumRoutes = router;
