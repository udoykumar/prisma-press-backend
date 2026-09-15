import { Router } from "express";
import { auth } from "../middleware/auth";
import { Role } from "../../generated/prisma/enums";
import { postConrtoller } from "./post.controller";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  postConrtoller.createPost,
);
router.get("/", postConrtoller.getAllPosts);
router.get("/stats", auth(Role.ADMIN), postConrtoller.getPostStarts);
router.get(
  "/my-posts",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  postConrtoller.getMyPosts,
);
router.get("/:postId", postConrtoller.getPostById);
router.delete(
  "/:postId",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  postConrtoller.deletedPost,
);
router.patch(
  "/:postId",
  auth(Role.AUTHOR, Role.USER, Role.ADMIN),
  postConrtoller.updatePost,
);

export const postRouters = router;
