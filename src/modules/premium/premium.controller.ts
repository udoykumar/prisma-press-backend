import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utilis/catchAsync";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status";
import { premiumService } from "./premium.service";
const premiumContent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await premiumService.getPremiumContent(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "premium content Retrieve successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const premiumController = {
  premiumContent,
};
