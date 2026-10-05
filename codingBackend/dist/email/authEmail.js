"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordChangedEmail = exports.sendOtpEmail = void 0;
const mailer_1 = require("../config/mailer");
const env_1 = require("../config/env");
const sendOtpEmail = async (data) => {
    try {
        const mailOptions = {
            from: env_1.config.smtp.from.address,
            to: data.to,
            subject: 'Your OTP Code',
            text: `Hello ${data.firstName}, your OTP code is: ${data.code}.
        use this code to ${data.purpose}. It will expire in 10 minutes. Please do not share this code with anyone.`,
        };
        await mailer_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendPasswordChangedEmail = async (data) => {
    try {
        const mailOptions = {
            from: env_1.config.smtp.from.address,
            to: data.to,
            subject: 'Password Changed',
            text: `Hello ${data.firstName}, your password has been changed successfully.`,
        };
        await mailer_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Error sending password changed email:', error);
        throw new Error('Failed to send password changed email');
    }
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
