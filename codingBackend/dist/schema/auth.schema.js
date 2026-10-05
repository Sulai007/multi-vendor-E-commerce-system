"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendOtpSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordHelper_1 = require("../helper/passwordHelper");
const emailField = zod_1.z.string().trim().toLowerCase().email("A valid email is required");
const passwordField = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine(passwordHelper_1.isStrongPassword, { message: passwordHelper_1.PASSWORD_POLICY_MESSAGE });
const otpCodeField = zod_1.z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "OTP code must be numeric");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().trim().min(1, "First name is required").max(100),
        lastName: zod_1.z.string().trim().min(1, "Last name is required").max(100),
        email: emailField,
        password: passwordField,
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailField,
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
exports.verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailField,
        code: otpCodeField,
        purpose: zod_1.z.enum(["email_verification", "password_reset"]).default("email_verification"),
    }),
});
exports.resendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailField,
        purpose: zod_1.z.enum(["email_verification", "password_reset"]).default("email_verification"),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: emailField,
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        resetToken: zod_1.z.string().min(1, "resetToken is required"),
        newPassword: passwordField,
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, "refreshToken is required"),
    }),
});
exports.logoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, "refreshToken is required"),
    }),
});
