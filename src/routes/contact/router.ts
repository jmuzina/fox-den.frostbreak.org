import { Router } from "express";
import {
  contactUsController,
  contactUsMailServiceAvailable,
  contactUsRateLimiter,
  contactUsValidator,
} from "./controller.js";

const contactRouter = (): Router => {
  const router = Router();

  router.post(
    "/send",
    contactUsValidator,
    contactUsRateLimiter,
    contactUsMailServiceAvailable,
    contactUsController,
  );

  return router;
};

export default contactRouter;
