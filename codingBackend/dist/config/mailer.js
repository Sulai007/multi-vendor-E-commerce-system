"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMailerConnection = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
exports.transporter = nodemailer_1.default.createTransport({
    host: env_1.config.smtp.host,
    port: env_1.config.smtp.port,
    secure: env_1.config.smtp.secure,
    auth: {
        user: env_1.config.smtp.user,
        pass: env_1.config.smtp.password,
    },
});
const verifyMailerConnection = async () => {
    try {
        await exports.transporter.verify();
        logger_1.logger.info("SMTP connection verified successfully.");
    }
    catch (error) {
        logger_1.logger.error("SMTP connection verification failed:", { error });
        throw error;
    }
};
exports.verifyMailerConnection = verifyMailerConnection;
