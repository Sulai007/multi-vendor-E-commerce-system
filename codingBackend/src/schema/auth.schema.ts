import { z } from "zod";
import { PASSWORD_POLICY_MESSAGE, isStrongPassword } from "../helper/passwordHelper";

const emailField = z.string().trim().toLowerCase().email("A valid email is required");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine(isStrongPassword, { message: PASSWORD_POLICY_MESSAGE });

const otpCodeField = z
  .string()
  .trim()
  .regex(/^\d{4,10}$/, "OTP code must be numeric");

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    email: emailField,
    password: passwordField,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailField,
    code: otpCodeField,
    purpose: z.enum(["email_verification", "password_reset"]).default("email_verification"),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: emailField,
    purpose: z.enum(["email_verification", "password_reset"]).default("email_verification"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailField,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "resetToken is required"),
    newPassword: passwordField,
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken is required"),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "refreshToken is required"),
  }),
});
