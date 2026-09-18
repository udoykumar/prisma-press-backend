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
import stripe from "./lib/stripe";
import { premiumRoutes } from "./modules/premium/premium.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

const endpointSecret = config.stripe_webhook_secret;

// app.post(
//   "/api/subscription/webhook",
//   express.raw({ type: "application/json" }),
//   (request, response) => {
//     let event = request.body;
//     console.log(event, "stripe event");
//     console.log(request.headers, "stript req headers");
//     // Only verify the event if you have an endpoint secret defined.
//     // Otherwise use the basic event deserialized with JSON.parse
//     if (endpointSecret) {
//       // Get the signature sent by Stripe
//       const signature = request.headers["stripe-signature"]!;
//       try {
//         event = stripe.webhooks.constructEvent(
//           request.body,
//           signature,
//           endpointSecret,
//         );
//       } catch (err: any) {
//         console.log(`⚠️  Webhook signature verification failed.`, err.message);
//         return response.status(400).json({
//           message: err.message,
//         });
//       }
//     }
//     console.log(event, "constructevent event");

//
//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   },
// );

app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouters);
app.use("/api/comments", commentRouter);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/premium", premiumRoutes);
app.use(notFound);

app.use(globalErrorHandler);

export default app;
