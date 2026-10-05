"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const sequelize_1 = require("sequelize");
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({ success: false, message: "Not Found" });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let details;
    if (err instanceof apiError_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    }
    else if (err instanceof sequelize_1.UniqueConstraintError) {
        statusCode = 409;
        message = "A record with these details already exists";
        details = err.errors.map((e) => ({ path: e.path, message: e.message }));
    }
    else if (err instanceof sequelize_1.ValidationError) {
        statusCode = 400;
        message = "validation failed";
        details = err.errors.map((e) => ({ path: e.path, message: e.message }));
    }
    else if (err instanceof Error) {
        message = env_1.config.isProduction ? message : err.message;
    }
    const logPayload = {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    };
    if (statusCode >= 500) {
        logger_1.logger.error("unhandled request error", logPayload);
    }
    else {
        logger_1.logger.warn("Request error", logPayload);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(details != undefined ? { errors: details } : {}),
    });
};
exports.errorHandler = errorHandler;
