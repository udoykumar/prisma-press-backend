import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utilis/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status";

const createComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const authorId = req.user?.id as string;
    const result = await commentService.createComments(payload, authorId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comment created successfully",
      data: result,
    });
  },
);

const getCommentByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;
    const result = await commentService.getCommentByAuthorId(
      authorId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comment found successfully",
      data: result,
    });
  },
);

const getAllComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await commentService.getAllComments();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comments retrieved successfully",
      data: result,
    });
  },
);

const getCommentsByPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    if (!postId) {
      throw new Error("Post id is required");
    }
    const result = await commentService.getCommentsByPost(postId as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post comments retrieved successfully",
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
      statusCode: httpStatus.OK,
      message: "single comment get successfully",
      data: result,
    });
  },
);

const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    if (!commentId) {
      throw new Error("Comment id is required");
    }
    const authorId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN";
    const payload = req.body;

    const result = await commentService.updateComment(
      commentId as string,
      payload,
      authorId,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment updated successfully",
      data: result,
    });
  },
);

const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    if (!commentId) {
      throw new Error("Comment id is required");
    }
    const isAdmin = req.user?.role === "ADMIN";
    const author = req.user?.role === "AUTHOR";

    const result = await commentService.deleteComment(
      commentId as string,
      isAdmin,
      author,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment deleted successfully",
      data: result,
    });
  },
);

export const commentController = {
  createComments,
  getAllComments,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
