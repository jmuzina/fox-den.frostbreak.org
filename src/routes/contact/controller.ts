import { NextFunction, Request, Response } from "express";
import { mailService } from "../../services/index.js";
import { HttpException } from "../../exceptions/index.js";
import { body, query, validationResult } from "express-validator";
import { logger } from "../../utils/index.js";
import { ValidationErrorToError } from "../../middleware/errorHandler.js";

const { MAIL_CONTACT_ADDRESS } = process.env;

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
