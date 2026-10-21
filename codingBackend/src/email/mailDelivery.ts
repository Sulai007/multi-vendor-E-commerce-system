import { config } from "../config/env";
import { transporter } from "../config/mailer";
import { logger } from "../utils/logger";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async ({ to, subject, text }: EmailMessage): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.smtp.from.address,
      to,
      subject,
      text,
    });
  } catch (error) {
    logger.error("Email delivery failed", { subject, error });
    throw new Error(`Failed to send email: ${subject}`);
  }
};

export const sendEmailSafely = async (send: () => Promise<void>): Promise<void> => {
  try {
    await send();
  } catch (error) {
    logger.error("Notification email failed after the operation completed", { error });
  }
};
