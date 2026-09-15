import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utilis/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../utilis/sendResponse";
import httpStatus from "http-status";
const createComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const authorId = req.user?.id as string;
    const result = await commentService.createComments(payload, authorId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created successfully",
      data: result,
    });
  },
);

const getCommentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId as string;
    const result = await commentService.getCommentById(commentId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "single comment get successfully",
      data: result,
    });
  },
);

export const commentController = {
  createComments,
  getCommentById,
};
