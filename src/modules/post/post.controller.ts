import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utilis/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utilis/sendResponse";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    const payload = req.body;
    const result = await postService.createPost(payload, id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created successfully",
      data: result,
    });
  },
);
const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await postService.getAllPost(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);
const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;

  if (!postId) {
    throw new Error("Post id is required");
  }
  const result = await postService.getPostById(postId as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post retrived successfully",
    data: { result },
  });
};
const getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
  const authorId = req.user?.id;
  const result = await postService.getMyPosts(authorId as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My Post retrived successfully",
    data: result,
  });
};
const getPostStarts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getPostsStats();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "post starts retrive successfully",
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const postId = req.params.postId;
    if (!postId) {
      throw new Error("Post id is required");
    }

    const payload = req.body;
    const result = await postService.updatePost(
      postId as string,
      payload,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post updated successfully",
      data: result,
    });
  },
);

const deletedPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    if (!postId) {
      throw new Error("Post id is required");
    }
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const result = await postService.deletedPost(
      postId as string,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post deleted successfully",
      data: null,
    });
  },
);

export const postConrtoller = {
  createPost,
  getPostStarts,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletedPost,
};
