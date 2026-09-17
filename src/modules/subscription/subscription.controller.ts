import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utilis/catchAsync";
import { subscriptionService } from "./subscription.service";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status";
const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const result = await subscriptionService.createCheckoutSession(
      userId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "checkout completed successfully",
      data: result,
    });
  },
);

export const subscriptionController = {
  createCheckoutSession,
};
