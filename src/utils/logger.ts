import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
  ),
);

const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format,
);

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

export default winston.createLogger({
  level: level(),
  levels,
  format: process.env.NODE_ENV === "development" ? developmentFormat : format,
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "development" ? developmentFormat : format,
      level: "debug",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      format: format,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      level: "info",
      format: format,
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});
