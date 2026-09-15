import { prisma } from "../lib/prisma";
import { catchAsync } from "../utilis/catchAsync";
import { ICommentPayload } from "./comment.interface";

const createComments = async (payload: ICommentPayload, authorId: string) => {
  await prisma.post.findFirstOrThrow({
    where: {
      id: payload.postId,
    },
  });
  const comment = await prisma.comment.create({
    data: { ...payload, authorId },
  });
  return comment;
};

const getCommentById = async (commentId: string) => {
  const comment = await prisma.comment.findFirstOrThrow({
    where: { id: commentId },
  });
  return comment;
};

export const commentService = {
  createComments,
  getCommentById,
};
