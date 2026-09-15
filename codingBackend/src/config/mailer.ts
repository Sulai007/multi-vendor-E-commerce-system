import nodemailer, { Transporter } from "nodemailer";
import { config } from "./env";
import { logger } from "../utils/logger";

const transporter: Transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
    },
});

export const verifyMailerConnection = async (): Promise<void> => {
    try {
        await transporter.verify();
        logger.info("SMTP connection verified successfully.");
    } catch(error) {
        logger.error("SMTP connection verification failed:", { error });
        throw error;
    }
};
