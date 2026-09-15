import winston = require('winston');
import path from "path";
import { config } from "../config/env";

//import { time } from 'console';
//import { json } from 'zod/v4/classic/external.cjs';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp: ts, stack, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${ts} [${level}]: ${stack || message} ${metaString}`;
    })
);

const fileFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logDir = path.resolve(process.cwd(), "logs");

export const 
logger = winston.createLogger({
    level: config.isProduction ? "info" : "debug",
    format: fileFormat,
    defaultMeta: { service: config.appName },
    transports: [
        new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
        new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
    ],
    exitOnError: false,
});

if (!config.isProduction) {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
};