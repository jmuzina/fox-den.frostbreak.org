import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/index.js";
import logger from "../utils/logger.js";
import { ValidationError } from "express-validator";

const { NODE_ENV } = process.env;

const errorEnvironmentHandler = (
  res: Response,
  error: Error | HttpException,
) => {
  const status = error instanceof HttpException ? error.status : 500;
  const messageMain =
    error instanceof HttpException ? error.message : "Something went wrong!";
  const messageDetail =
    error instanceof HttpException
      ? error.data?.errors?.map((err) => err.message).join("\n")
      : undefined;
  return res.status(status).send(`${messageMain}\n${messageDetail || ""}`);
};

export const ValidationErrorToError = (err: ValidationError): HttpException => {
  return new HttpException(400, err.msg);
};

/**
 * @param err The error object caught.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The Express next middleware function.
 */
const errorHandler = (
  err: Error | HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.error(err);
    logger.error(`Error encountered: ${err.message}`, err.stack);
    errorEnvironmentHandler(res, err);
  } catch (catchErr) {
    logger.error(
      "Error in errorHandler middleware while handling error",
      err,
      "catchErr was",
      catchErr,
    );
    errorEnvironmentHandler(
      res,
      catchErr instanceof Error
        ? catchErr
        : new Error("Unknown error in errorHandler"),
    );
  }
};

export default errorHandler;
