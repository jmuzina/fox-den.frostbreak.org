import { Router } from "express";
import {
  contactUsController,
  contactUsMailServiceAvailable,
  contactUsRateLimiter,
  contactUsValidator,
} from "./controller.js";
import { validateReferrer } from "../../middleware/index.js";

const contactRouter = (): Router => {
  const router = Router();

  router.post(
    "/send",
    validateReferrer,
    contactUsValidator,
    contactUsRateLimiter,
    contactUsMailServiceAvailable,
    contactUsController,
  );

  return router;
};

export default contactRouter;
