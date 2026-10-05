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

// /**
//  * @swagger
//  * /api/auth/logs:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Retrieve API request logs
//  *     description: Returns API request logs for administrators after validating the administrator password. Logs are ordered from newest to oldest.
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [password]
//  *             properties:
//  *               password:
//  *                 type: string
//  *                 format: password
//  *                 example: "AdminStrongP@ss1"
//  *     responses:
//  *       '200':
//  *         description: API logs retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success: { type: boolean, example: true }
//  *                 message: { type: string, example: API logs retrieved successfully }
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     logs:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           id: { type: string, format: uuid }
//  *                           method: { type: string, example: GET }
//  *                           statusCode: { type: integer, example: 200 }
//  *                           ipAddress: { type: string, example: 127.0.0.1 }
//  *       '401':
//  *         description: Missing or invalid access token, or invalid administrator password
//  *         content:
//  *           application/json:
//  *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
//  *       '403':
//  *         description: Authenticated user is not an administrator
//  *         content:
//  *           application/json:
//  *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
//  *       '400':
//  *         description: Password was not provided
//  *         content:
//  *           application/json:
//  *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
//  *       '500':
//  *         description: Failed to retrieve API logs
//  *         content:
//  *           application/json:
//  *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
//  */
// router.post("/logs",authenticate, authorize("admin"), requirePassword, authController.getApiLogs);

// /**
//  * @swagger
//  * /api/auth/accessPassword:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Verify administrator access
//  *     description: Allows access only to authenticated users with the administrator role to set an access password for sensitive operations. The provided password is validated against the stored administrator password.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [password]
//  *             properties:
//  *               password:
//  *                 type: string
//  *                 format: password
//  *                 description: New administrator password
//  *                 example: "AdminStrongP@ss1"
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       '200':
//  *         description: Administrator access verified
//  *       '401':
//  *         description: Missing or invalid access token
//  *         content:
//  *           application/json:
//  *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
//  *       '403':
//  *         description: Authenticated user is not an administrator
//  *         content:
//  *           application/json:
//  *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
//  */
// router.post("/accessPassword", authenticate, authorize("admin"), authController.updatePassword);

export default router;
