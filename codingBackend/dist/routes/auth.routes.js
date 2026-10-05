"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const auth_schema_1 = require("../schema/auth.schema");
const router = (0, express_1.Router)();
router.post("/register", rateLimiter_middleware_1.registerRateLimiter, (0, validate_middleware_1.validate)(auth_schema_1.registerSchema), authController.register);
router.post("/login", rateLimiter_middleware_1.loginRateLimiter, (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), authController.login);
router.post("/verify-otp", rateLimiter_middleware_1.otpRateLimiter, (0, validate_middleware_1.validate)(auth_schema_1.verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", rateLimiter_middleware_1.otpRateLimiter, (0, validate_middleware_1.validate)(auth_schema_1.resendOtpSchema), authController.resendOtp);
router.post("/forgot-password", rateLimiter_middleware_1.forgotPasswordRateLimiter, (0, validate_middleware_1.validate)(auth_schema_1.forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", (0, validate_middleware_1.validate)(auth_schema_1.resetPasswordSchema), authController.resetPassword);
router.post("/refresh-token", (0, validate_middleware_1.validate)(auth_schema_1.refreshTokenSchema), authController.refreshToken);
router.post("/logout", auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(auth_schema_1.logoutSchema), authController.logout);
router.get("/me", auth_middleware_1.authenticate, authController.me);
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
exports.default = router;
