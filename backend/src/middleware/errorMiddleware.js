import { errorResponse } from "../utils/response.js";
import multer from "multer";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof multer.MulterError ? 400 : err.statusCode || 500;
  const message = err.code === "LIMIT_FILE_SIZE" ? `File exceeds the configured ${process.env.MAX_FILE_SIZE_MB || 25} MB limit` : err.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "production" ? null : err.stack
  );
};
