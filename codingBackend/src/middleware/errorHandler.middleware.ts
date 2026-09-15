import { NextFunction, Request, Response } from "express";
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from "sequelize";
import {ApiError} from "../utils/apiError";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).json({ success: false, message: "Not Found" });
};

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let details: unknown;

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    } else if (err instanceof UniqueConstraintError) {
        statusCode = 409;
        message = "A record with these details already exists";
        details = err.errors.map((e) => ({ path: e.path, message: e.message }));
    } else if (err instanceof SequelizeValidationError) {
        statusCode = 400;
        message = "validation failed";
        details = err.errors.map((e) => ({ path: e.path, message: e.message }));
    } else if (err instanceof Error) {
        message = config.isProduction ? message : err.message;
    }

    const logPayload = {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    };

    if (statusCode >= 500) {
        logger.error("unhandled request error", logPayload);
    } else {
        logger.warn("Request error", logPayload);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(details != undefined ? { errors: details } : {}),
    });
};