import { Router } from "express";
import { commentController } from "./comment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.createComments,
);

router.get("/", commentController.getAllComments);

router.get("/post/:postId", commentController.getCommentsByPost);

router.get(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.getCommentById,
);

router.patch(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.updateComment,
);

router.delete(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR),
  commentController.deleteComment,
);

export const commentRouter = router;
