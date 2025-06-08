import { Router } from "express";
import healthRouter from "./health/router.js";
import contactRouter from "./contact/router.js";

const globalRouter = (): Router => {
  const router = Router();

  router.use("/contact", contactRouter());
  router.use("/health", healthRouter());

  return router;
};

export default globalRouter;
