import { CommentStatus } from "../../../generated/prisma/enums";

export interface ICommentPayload {
  postId: string;
  content: string;
}

export interface IUpdateCommentPayload {
  content?: string;
  status?: CommentStatus;
}
