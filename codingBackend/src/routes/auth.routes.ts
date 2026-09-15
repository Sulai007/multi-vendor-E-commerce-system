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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     description: Creates a new user account and sends a 6-digit OTP to the given email for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: Jane }
 *               lastName: { type: string, example: Doe }
 *               email: { type: string, format: email, example: jane.doe@example.com }
 *               password: { type: string, format: password, example: "StrongP@ss1" }
 *     responses:
 *       '201':
 *         description: Registration successful, verification code sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '409':
 *         description: Email already registered and verified
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/register", registerRateLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     description: Returns an access token and refresh token for a verified, active account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     accessToken: { type: string }
 *                     accessTokenExpiresAt: { type: string, format: date-time }
 *                     refreshToken: { type: string }
 *                     refreshTokenExpiresAt: { type: string, format: date-time }
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: Account inactive or email not verified
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/login", loginRateLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify a one-time code
 *     description: >
 *       Verifies a code sent by email. For `email_verification`, activates the account.
 *       For `password_reset`, consumes the code and returns a short-lived `resetToken`
 *       to be used with `/api/auth/reset-password`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string, example: "123456" }
 *               purpose:
 *                 type: string
 *                 enum: [email_verification, password_reset]
 *                 default: email_verification
 *     responses:
 *       '200':
 *         description: Code verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     resetToken: { type: string, description: Present only when purpose=password_reset }
 *       '400':
 *         description: Invalid, expired, or already-used code
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/verify-otp", otpRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend a one-time code
 *     description: Issues a new OTP for the given purpose, subject to a cooldown period.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *               purpose:
 *                 type: string
 *                 enum: [email_verification, password_reset]
 *                 default: email_verification
 *     responses:
 *       '200':
 *         description: Code resent (or silently ignored for unknown emails on password_reset)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       '429':
 *         description: Resend requested too soon
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/resend-otp", otpRateLimiter, validate(resendOtpSchema), authController.resendOtp);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset code
 *     description: Always returns a generic success message to avoid leaking whether an email is registered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       '200':
 *         description: Generic success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 */
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a verified reset token
 *     description: Requires the `resetToken` obtained from `/api/auth/verify-otp` with purpose=password_reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resetToken, newPassword]
 *             properties:
 *               resetToken: { type: string }
 *               newPassword: { type: string, format: password, example: "NewStrongP@ss1" }
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       '401':
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new token pair
 *     description: Rotates the refresh token; reuse of an already-rotated token revokes all sessions for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       '200':
 *         description: New token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     accessToken: { type: string }
 *                     accessTokenExpiresAt: { type: string, format: date-time }
 *                     refreshToken: { type: string }
 *                     refreshTokenExpiresAt: { type: string, format: date-time }
 *       '401':
 *         description: Invalid, expired, or reused refresh token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out the current session
 *     description: Revokes the given refresh token and blacklists the current access token so it cannot be reused.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       '401':
 *         description: Missing/invalid access token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/logout", authenticate, validate(logoutSchema), authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       '401':
 *         description: Missing/invalid access token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
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
