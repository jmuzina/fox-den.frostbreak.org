import { Router, urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import i18n from "./i18n.js";

const { NODE_ENV } = process.env;

const middlewares = async (): Promise<Router> => {
  const router = Router();

  router.use(await i18n());

  // Security
  router.use(cors());
  router.use(helmet());
  // // Body Parsers
  router.use(json());
  router.use(urlencoded({ extended: true }));
  //
  // // logging
  router.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
  //
  router.use(compression());
  router.use(cookieParser());

  return router;
};

export default middlewares;

export { default as errorHandler } from "./errorHandler.js";
export * from "./referrer.js";
