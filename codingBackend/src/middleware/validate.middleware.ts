import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { ApiError } from "../utils/apiError";

export const validate =
  (schema: z.ZodType<{ body?: unknown; params?: unknown; query?: unknown }>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params as Request["params"];

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          path: issue.path.slice(1).join("."),
          message: issue.message,
        }));
        return next(ApiError.badRequest("Validation failed", details));
      }
      next(error);
    }
  };
