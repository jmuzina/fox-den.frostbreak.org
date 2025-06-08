import "dotenv/config";

import express, { Application } from "express";
import middlewares, { errorHandler } from "./middleware/index.js";
import globalRouter from "./routes/index.js";

try {
  const PORT = process.env.PORT || 3000;
  const HOSTNAME = process.env.HOSTNAME || "localhost";
  const PROTOCOL = process.env.PROTOCOL || "http";
  const SERVICE_ADDRESS = `${PROTOCOL}://${HOSTNAME}:${PORT}`;

  const app: Application = express();

  app.use(await middlewares());
  app.use(globalRouter());
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on ${SERVICE_ADDRESS}`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
  process.exit(1);
}
