"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston = require("winston");
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
//import { time } from 'console';
//import { json } from 'zod/v4/classic/external.cjs';
const { combine, timestamp, printf, colorize, errors, json } = winston.format;
const consoleFormat = combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${ts} [${level}]: ${stack || message} ${metaString}`;
}));
const fileFormat = combine(timestamp(), errors({ stack: true }), json());
const logDir = path_1.default.resolve(process.cwd(), "logs");
exports.logger = winston.createLogger({
    level: env_1.config.isProduction ? "info" : "debug",
    format: fileFormat,
    defaultMeta: { service: env_1.config.appName },
    transports: [
        new winston.transports.File({ filename: path_1.default.join(logDir, "error.log"), level: "error" }),
        new winston.transports.File({ filename: path_1.default.join(logDir, "combined.log") }),
    ],
    exitOnError: false,
});
if (!env_1.config.isProduction) {
    exports.logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}
;
