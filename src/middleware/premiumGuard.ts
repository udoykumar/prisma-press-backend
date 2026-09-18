import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utilis/catchAsync";
import { prisma } from "../lib/prisma";
import { subscriptionStatus } from "../../generated/prisma/enums";

export const subscriptionGuard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Please subscribe to get access to Premium contents");
    }

    if (subscription?.status !== subscriptionStatus.ACTIVE) {
      throw new Error(
        "Please subscribed again to get access to premium content",
      );
    }
    next();
  });
};
