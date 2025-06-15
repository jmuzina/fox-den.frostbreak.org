import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/index.js";
import { logger } from "../utils/index.js";

const { APPROVED_REFERRERS } = process.env;

/**
 * Middleware to validate that requests come from approved referrers.
 * Throws a 403 Forbidden error if the referrer is not in the approved list.
 * Supports regex patterns in the APPROVED_REFERRERS environment variable.
 */
export const validateReferrer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const referrer = req.get("Referer") || req.get("Origin");

  if (!referrer) {
    logger.warn("Request received without referrer header");
    return next(new HttpException(403, req.t("referrer_validation_error")));
  }

  const approvedReferrers =
    APPROVED_REFERRERS?.split(",").map((ref) => ref.trim()) || [];

  if (approvedReferrers.length === 0) {
    logger.warn("No approved referrers configured");
    return next(new HttpException(403, req.t("referrer_validation_error")));
  }

  const isApproved = approvedReferrers.some((approvedRef) => {
    try {
      if (approvedRef.startsWith("/") && approvedRef.endsWith("/")) {
        const pattern = approvedRef.slice(1, -1);
        const regex = new RegExp(pattern);
        return regex.test(referrer);
      }
      return referrer.startsWith(approvedRef);
    } catch (error) {
      logger.error(
        `Invalid regex pattern in APPROVED_REFERRERS: ${approvedRef}`,
      );
      return false;
    }
  });

  if (!isApproved) {
    logger.warn(`Request from unauthorized referrer: ${referrer}`);
    return next(new HttpException(403, req.t("referrer_validation_error")));
  }

  next();
};
