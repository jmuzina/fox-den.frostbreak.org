import { NextFunction, Request, Response } from "express";
import { mailService } from "../../services/index.js";
import { HttpException } from "../../exceptions/index.js";
import { body, validationResult } from "express-validator";
import { logger } from "../../utils/index.js";
import { ValidationErrorToError } from "../../middleware/errorHandler.js";
import { rateLimit } from "express-rate-limit";

const { MAIL_CONTACT_ADDRESS } = process.env;

export const contactUsMailServiceAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const available = await mailService.reverify();
  if (available) return next();

  logger.warn(
    "Mail service is not available. Contact form submission will fail.",
  );
  return next(
    new HttpException(503, req.t("contact_us_mail_service_unavailable")),
  );
};

export const contactUsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 3, // Limit each IP to 3 emails per windowMs / 3 emails per hour
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

export const contactUsValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage((value, { req }) =>
      req.t("validation_error_name_invalid_type"),
    )
    .trim()
    .isLength({ max: 50 })
    .withMessage((value, { req }) => req.t("validation_error_name_length")),
  body("email")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation_error_email_required"))
    .isEmail()
    .withMessage((value, { req }) => req.t("validation_error_email_invalid"))
    .normalizeEmail(),
  body("subject")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation_error_subject_required"))
    .escape()
    .withMessage((value, { req }) =>
      req.t("validation_error_subject_malformed"),
    )
    .isString()
    .withMessage((value, { req }) =>
      req.t("validation_error_subject_invalid_type"),
    )
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage((value, { req }) => req.t("validation_error_subject_length")),
  body("message")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation_error_message_required"))
    .escape()
    .withMessage((value, { req }) =>
      req.t("validation_error_subject_malformed"),
    )
    .isString()
    .withMessage((value, { req }) =>
      req.t("validation_error_message_invalid_type"),
    )
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage((value, { req }) => req.t("validation_error_message_length")),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      logger.warn(
        `Contact form validation failed: ${errorMessages.join(" | ")}`,
      );
      return next(
        new HttpException(400, req.t("validation_error_general_message"), {
          errors: errors.array().map(ValidationErrorToError),
        }),
      );
    }
    next();
  },
];

export const contactUsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await mailService.sendMail({
      from: `${req.body.name} <${req.body.email}>`,
      to: MAIL_CONTACT_ADDRESS,
      subject: req.body.subject,
      date: new Date(),
      html: `${req.body.name} (${req.body.email}) sent a message via the frostbreak.org contact form:<br/>${req.body.message}`,
    });
    res.status(200).send(req.t("contact_us_success_message"));
  } catch (error) {
    const statusCode = error instanceof HttpException ? error.status : 500;
    next(
      new HttpException(statusCode, req.t("contact_us_error_message"), {
        extra: error,
      }),
    );
  }
};
