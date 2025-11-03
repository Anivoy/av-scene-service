import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = "Internal server error";
  let details;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    details = err.errors.map(e => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.meta;
  }

  logger.error(message, { statusCode, details, stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { errors: details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
