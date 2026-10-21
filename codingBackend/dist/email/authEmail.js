"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordChangedEmail = exports.sendOtpEmail = exports.sendWelcomeEmail = void 0;
const env_1 = require("../config/env");
const mailer_1 = require("../config/mailer");
const sendAuthEmail = async (data) => {
    try {
        await mailer_1.transporter.sendMail({
            from: env_1.config.smtp.from.address,
            to: data.to,
            subject: data.subject,
            text: data.text,
        });
    }
    catch (error) {
        console.error("Error sending authentication email:", error);
        throw new Error(`Failed to send email: ${data.subject}`);
    }
};
const sendWelcomeEmail = async (data) => {
    await sendAuthEmail({
        to: data.to,
        subject: "Welcome to the marketplace",
        text: `Hello ${data.firstName},

Your email address is verified and your account is ready to use. You can now sign in, browse businesses and products, and manage your orders from your account.

We are glad to have you with us.

The Marketplace Team`,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendOtpEmail = async (data) => {
    const purpose = data.purpose.replace(/_/g, " ");
    const subject = data.purpose === "email_verification"
        ? "Verify your email address"
        : "Your password reset code";
    await sendAuthEmail({
        to: data.to,
        subject,
        text: `Hello ${data.firstName},

We received a request to ${purpose} for your account. Enter the one-time code below to continue:

    ${data.code}

This code expires in 10 minutes and can only be used once. For your security, never share it with anyone, including someone claiming to be from our team.

If you did not make this request, you can ignore this email. Your account will remain unchanged.`,
    });
};
exports.sendOtpEmail = sendOtpEmail;
const sendPasswordChangedEmail = async (data) => {
    await sendAuthEmail({
        to: data.to,
        subject: "Your password was changed",
        text: `Hello ${data.firstName},

The password for your account was changed successfully. For your protection, stored refresh-token sessions have been revoked. Your current access token may remain valid until it expires, after which you will need to sign in again.

If you made this change, no further action is needed. If you did not change your password, use the password reset option on the sign-in page to secure your account as soon as possible.

Thank you,
The Account Security Team`,
    });
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
