"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, details, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = "Bad Request", details) {
        return new ApiError(400, message, details);
    }
    static unauthorized(message = "Unauthorized", details) {
        return new ApiError(401, message, details);
    }
    static forbidden(message = "Forbidden", details) {
        return new ApiError(403, message, details);
    }
    static notFound(message = "Not Found", details) {
        return new ApiError(404, message, details);
    }
    static conflict(message = "Conflict", details) {
        return new ApiError(409, message, details);
    }
    static tooManyRequests(message = "Too Many Requests", details) {
        return new ApiError(429, message, details);
    }
    static internalServerError(message = "Internal Server Error", details) {
        return new ApiError(500, message, details);
    }
}
exports.ApiError = ApiError;
