import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./modules/user/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { postRouters } from "./post/post.route";
import { commentRouter } from "./comments/comment.route";

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

export default app;
