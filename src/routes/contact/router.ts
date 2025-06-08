import { Router } from "express";
import { contactUsController, contactUsValidator } from "./controller.js";

const contactRouter = (): Router => {
  const router = Router();

  router.post("/send", contactUsValidator, contactUsController);

  return router;
};

export default contactRouter;
