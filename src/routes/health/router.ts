import { Router } from "express";
import { healthController } from "./controller.js";

const healthRouter = (): Router => {
  const router = Router();

  router.get("/", healthController);

  return router;
};

export default healthRouter;
