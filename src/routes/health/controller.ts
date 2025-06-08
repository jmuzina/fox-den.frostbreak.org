import { NextFunction, Request, Response } from "express";

export const healthController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({ status: "ok", message: "Service is healthy" });
};
