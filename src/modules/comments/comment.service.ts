import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICommentPayload, IUpdateCommentPayload } from "./comment.interface";

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

const getCommentByAuthorId = async (authorId: string) => {
  const comments = await prisma.comment.findMany({
    where: { authorId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: { id: true, title: true },
      },
    },
  });
  return comments;
};
const getAllComments = async () => {
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        omit: { password: true },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  return comments;
};

const getCommentsByPost = async (postId: string) => {
  await prisma.post.findFirstOrThrow({
    where: { id: postId },
  });

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      status: CommentStatus.APPROVED,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        omit: { password: true },
      },
    },
  });
  return comments;
};

const getCommentById = async (commentId: string) => {
  const comment = await prisma.comment.findFirstOrThrow({
    where: { id: commentId },
    include: {
      author: {
        omit: { password: true },
      },
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
  return comment;
};

const updateComment = async (
  commentId: string,
  payload: IUpdateCommentPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const comment = await prisma.comment.findFirstOrThrow({
    where: { id: commentId },
  });

  if (!isAdmin && comment.authorId !== authorId) {
    throw new Error("You are not authorized to update this comment");
  }

  const result = await prisma.comment.update({
    where: { id: commentId },
    data: payload,
    include: {
      author: {
        omit: { password: true },
      },
    },
  });
  return result;
};

const deleteComment = async (
  commentId: string,
  isAdmin: boolean,
  author: boolean,
) => {
  await prisma.comment.findFirstOrThrow({
    where: { id: commentId },
  });

  if (!isAdmin) {
    throw new Error("forbiden user is not delete a comment");
  }
  if (!author) {
    throw new Error("forbiden user is not delete a comment");
  }

  const result = await prisma.comment.delete({
    where: { id: commentId },
  });
  return result;
};

export const commentService = {
  createComments,
  getCommentByAuthorId,
  getAllComments,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
