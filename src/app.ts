import express, { Application, NextFunction, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./modules/user/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { postRouters } from "./modules/post/post.route";
import { commentRouter } from "./modules/comments/comment.route";
import { notFound } from "./middleware/not-found";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { subscriptionRoutes } from "./modules/subscription/subscription.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouters);
app.use("/api/comments", commentRouter);
app.use("/api/subscription", subscriptionRoutes);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
