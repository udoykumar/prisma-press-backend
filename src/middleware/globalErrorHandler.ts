import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err, "error");

  let statusCode;
  let errorMessage = err.message || "Internal server error";
  let errorName = err.name || "internal server error";
  let errorDetails = err.stack;
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      ((statusCode = httpStatus.BAD_REQUEST),
        (errorMessage = "duplicat key error"));
    } else if (err.code === "P2003") {
      statusCode: (httpStatus.BAD_REQUEST,
        (errorMessage = "Foreign key constraint failed"));
    } else if (err.code === "P2025") {
      ((statusCode = httpStatus.BAD_REQUEST),
        (errorMessage =
          "An operation failed because it depends on one or more records that were required but not found"));
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      ((statusCode = httpStatus.INTERNAL_SERVER_ERROR),
        (errorMessage =
          "Authentication Failed against database server. Please check Your credentials"));
    }
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: errorMessage,
    error: err.stack,
  });
};
