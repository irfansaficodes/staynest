import { Request, Response, NextFunction } from "express";
import { ApiError } from "./error-utils";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const method = req.method;
  const path = req.path;

  if (err instanceof ApiError) {
    if (!err.isOperational) {
      console.error(`[CRITICAL ERROR] ${method} ${path}:`, err);
    } else {
      console.warn(`[APPLICATION ERROR] ${method} ${path}: ${err.message}`);
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  if (err instanceof Error) {
    if (err.name === "ValidationError") {
      const mongooseErrors: Record<string, string> = {};
      if ("errors" in err && typeof (err as any).errors === "object") {
        for (const [key, value] of Object.entries((err as any).errors)) {
          if (typeof value === "object" && value !== null && "message" in value) {
            mongooseErrors[key] = (value as any).message;
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: mongooseErrors,
      });
    }

    if (err.name === "CastError" && "kind" in err) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if ("code" in err && (err as any).code === 11000 && "keyPattern" in err) {
      const field = Object.keys((err as any).keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
  }

  console.error(`[UNHANDLED ERROR] ${method} ${path}:`, err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      details: err instanceof Error ? err.message : String(err),
    }),
  });
};

export default errorHandler;
