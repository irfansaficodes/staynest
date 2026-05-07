import { Request, Response, NextFunction } from "express";

function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "data-blocked:")
    .trim();
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body) as Record<string, unknown>;
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query) as Record<string, string | string[]>;
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params) as Record<string, string>;
  }
  next();
};

export default sanitizeInput;
