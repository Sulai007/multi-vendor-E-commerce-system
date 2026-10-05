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
const logController = __importStar(require("../controllers/logController"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const requirePassword_1 = require("../middleware/requirePassword");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/admin/logs:
 *   post:
 *     tags: [Admin]
 *     summary: Retrieve API request logs
 *     description: Returns API request logs for administrators after validating the administrator password. Logs are ordered from newest to oldest.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "AdminStrongP@ss1"
 *     responses:
 *       '200':
 *         description: API logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: API logs retrieved successfully }
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           method: { type: string, example: GET }
 *                           statusCode: { type: integer, example: 200 }
 *                           ipAddress: { type: string, example: 127.0.0.1 }
 *       '401':
 *         description: Missing or invalid access token, or invalid administrator password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: Authenticated user is not an administrator
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '400':
 *         description: Password was not provided
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Failed to retrieve API logs
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), requirePassword_1.requirePassword, logController.getApiLogs);
router.post("/getlogs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), requirePassword_1.requirePassword, logController.getApiLogs);
/**
 * @swagger
 * /api/admin/logs/accessPassword:
 *   post:
 *     tags: [Log]
 *     summary: Verify administrator access
 *     description: Allows access only to authenticated users with the administrator role to set an access password for sensitive operations. The provided password is validated against the stored administrator password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New administrator password
 *                 example: "AdminStrongP@ss1"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Administrator access verified
 *       '401':
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: Authenticated user is not an administrator
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/accessPassword", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), logController.updatePassword);
exports.default = router;
