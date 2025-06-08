import Mail from "nodemailer/lib/mailer/index.js";
import { SentMessageInfo } from "nodemailer";

export type MailOptions = Mail.Options;
export type MailSendResult = SentMessageInfo & unknown & { messageId: string };
