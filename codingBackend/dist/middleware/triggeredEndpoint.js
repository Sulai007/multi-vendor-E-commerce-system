"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPointLogger = void 0;
const logger_1 = require("../utils/logger");
const endPointLogger = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInMs = (duration[0] * 1000) + (duration[1] / 1e6);
        logger_1.logger.info(`Endpoint triggered: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${durationInMs.toFixed(3)} ms`, {
            ipAddress: req.ip,
            method: req.method,
            statusCode: res.statusCode,
            path: req.originalUrl,
            duration: Math.round(durationInMs),
            userId: req.user?.sub ?? null,
        });
    });
    next();
};
exports.endPointLogger = endPointLogger;
