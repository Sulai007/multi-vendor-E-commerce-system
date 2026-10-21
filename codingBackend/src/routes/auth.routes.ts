import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  loginRateLimiter,
  registerRateLimiter,
  otpRateLimiter,
  forgotPasswordRateLimiter,
} from "../middleware/rateLimiter.middleware";

import { 
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../schema/auth.schema";

const router = Router();

router.post("/register", registerRateLimiter, validate(registerSchema), authController.register);

router.post("/login", loginRateLimiter, validate(loginSchema), authController.login);

router.post("/verify-otp", otpRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);

router.post("/resend-otp", otpRateLimiter, validate(resendOtpSchema), authController.resendOtp);

router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);

router.post("/logout", authenticate, validate(logoutSchema), authController.logout);

router.get("/me", authenticate, authController.me);

export default router;
