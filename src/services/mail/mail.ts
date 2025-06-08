import nodemailer, { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer/index.js";
import { logger } from "../../utils/index.js";
import { MailSendResult } from "./types.js";

const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS } = process.env;

export class MailService {
  available = false;

  private nodeTransportOptions = {
    host: MAIL_HOST || "localhost",
    port: Number(MAIL_PORT) || (MAIL_SECURE == "true" ? 587 : 25),
    secure: MAIL_SECURE === "true",
    auth: {
      user: MAIL_USER || "",
      pass: MAIL_PASS || "",
    },
    tls: {
      rejectUnauthorized: MAIL_SECURE === "true",
    },
  };

  private transporter: Transporter = nodemailer.createTransport(
    this.nodeTransportOptions,
  );

  async sendMail(mailOptions: Mail.Options): Promise<MailSendResult> {
    try {
      if (!this.available) {
        logger.warn(
          "Mail transporter is not available. Attempting to initialize...",
        );
        await this.initialize();
      }
      const info: MailSendResult = await this.transporter.sendMail(mailOptions);
      logger.info(`Message sent: ${info.messageId}`);
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      return info;
    } catch (error) {
      logger.error(
        `Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  private async initialize() {
    return new Promise<void>(async (resolve, reject) => {
      let attemptNum = 0;
      const maxAttempts = 5;
      const retryInterval = 2000;

      let initError: Error | null = null;

      while (!this.available && attemptNum < maxAttempts) {
        try {
          ++attemptNum;
          this.available = await this.transporter.verify();
          attemptNum = 0;
          logger.info("Mail transporter is ready and available.");
        } catch (error) {
          initError = error as Error;
          logger.warn(
            `Attempt ${attemptNum} to verify mail transporter failed.`,
          );
          if (attemptNum < maxAttempts) {
            logger.info(
              `Retrying mail service validation in ${retryInterval}ms...\``,
            );
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
          }
        }
      }
      if (!this.available) {
        logger.error(
          `Failed to initialize mail transporter: ${initError instanceof Error ? initError.message : "Unknown error"}`,
        );
        reject(
          initError ||
            new Error(
              "Failed to initialize mail transporter after multiple attempts.",
            ),
        );
      } else {
        resolve();
      }
    });
  }

  constructor() {
    console.log("NODE OPTIONS", this.nodeTransportOptions);
    this.initialize().catch((err) => {
      console.warn(
        `Mail service failed to initialize: ${err instanceof Error ? err.message : "Unknown error"} API will remain up and retry initialization on the next request.`,
      );
    });
  }
}

export default new MailService();
