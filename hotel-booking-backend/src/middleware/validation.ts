import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { errorResponse } from "./error-utils";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string[]> = {};
    errors.array().forEach((err) => {
      if ("path" in err && typeof err.path === "string") {
        if (!formattedErrors[err.path]) {
          formattedErrors[err.path] = [];
        }
        formattedErrors[err.path].push(err.msg);
      }
    });
    return errorResponse(res, 400, "Validation failed", formattedErrors);
  }
  next();
};

export const requireValidation = (...validations: ValidationChain[]) => {
  return [...validations, validateRequest];
};
