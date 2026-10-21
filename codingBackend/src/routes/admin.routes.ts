import { Router } from "express";
import * as logController from "../controllers/logController";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { requirePassword } from "../middleware/requirePassword";
import { validate } from "../middleware/validate.middleware";
import { paginationRequestSchema } from "../schema/paginationSchema";
import {
    getUsersSchema,
    updateUserRoleSchema,
    updateUserStatusSchema,
    getBusinessesSchema,
    verifyBusinessSchema,
    updateBusinessStatusSchema,
    getProductsSchema,
    updateProductStatusSchema,
    getOrdersSchema,
    getUserByIdSchema,
    getBusinessByIdAdminSchema,
    getProductByIdAdminSchema,
    getOrderByIdAdminSchema,
    updateAdminOrderStatusSchema,
    getRefundRequestsAdminSchema,
    updateRefundStatusAdminSchema,
} from "../schema/adminSchema";

const router = Router();

/**
 * @swagger
 * /api/admin/logs:
 *   post:
 *     tags: [Admin]
 *     summary: Retrieve API request logs
 *     description: Returns API request logs for administrators after validating the administrator password. Logs are ordered from newest to oldest.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
router.post("/", authenticate, authorize("admin"), validate(paginationRequestSchema), requirePassword, logController.getApiLogs);
router.get("/logs", authenticate, authorize("admin"), validate(paginationRequestSchema), requirePassword, logController.getApiLogs);
router.post("/logs", authenticate, authorize("admin"), validate(paginationRequestSchema), requirePassword, logController.getApiLogs);
router.post("/getlogs", authenticate, authorize("admin"), validate(paginationRequestSchema), requirePassword, logController.getApiLogs);

/**
 * @swagger
 * /api/admin/accessPassword:
 *   post:
 *     tags: [Admin]
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
router.post("/accessPassword", authenticate, authorize("admin"), logController.updatePassword);

router.get("/users", authenticate, authorize("admin"), validate(getUsersSchema), logController.getUsers);
router.get("/users/:userId", authenticate, authorize("admin"), validate(getUserByIdSchema), logController.getUserById);
router.patch("/users/:userId/role", authenticate, authorize("admin"), validate(updateUserRoleSchema), logController.updateUserRole);
router.patch("/users/:userId/status", authenticate, authorize("admin"), validate(updateUserStatusSchema), logController.updateUserStatus);

router.get("/businesses", authenticate, authorize("admin"), validate(getBusinessesSchema), logController.getBusinessesForAdmin);
router.get("/businesses/:businessId", authenticate, authorize("admin"), validate(getBusinessByIdAdminSchema), logController.getBusinessByIdForAdmin);
router.patch("/businesses/:businessId/verify", authenticate, authorize("admin"), validate(verifyBusinessSchema), logController.verifyBusiness);
router.patch("/businesses/:businessId/status", authenticate, authorize("admin"), validate(updateBusinessStatusSchema), logController.updateBusinessStatus);

router.get("/products", authenticate, authorize("admin"), validate(getProductsSchema), logController.getProductsForAdmin);
router.get("/products/:productId", authenticate, authorize("admin"), validate(getProductByIdAdminSchema), logController.getProductByIdForAdmin);
router.patch("/products/:productId/status", authenticate, authorize("admin"), validate(updateProductStatusSchema), logController.updateProductStatus);

router.get("/orders", authenticate, authorize("admin"), validate(getOrdersSchema), logController.getOrdersAdmin);
router.get("/orders/:orderId", authenticate, authorize("admin"), validate(getOrderByIdAdminSchema), logController.getOrderByIdAdmin);
router.patch("/orders/:orderId/status", authenticate, authorize("admin"), validate(updateAdminOrderStatusSchema), logController.updateAdminOrderStatus);

router.get("/refund-requests", authenticate, authorize("admin"), validate(getRefundRequestsAdminSchema), logController.getRefundRequestsAdmin);
router.patch("/refund-requests/:refundRequestId/status", authenticate, authorize("admin"), validate(updateRefundStatusAdminSchema), logController.updateRefundStatusAdmin);

router.get("/dashboard/summary", authenticate, authorize("admin"), logController.getDashboardSummary);
router.get("/metrics", authenticate, authorize("admin"), logController.getMetrics);
router.get("/settings", authenticate, authorize("admin"), logController.getSettings);
router.patch("/settings", authenticate, authorize("admin"), logController.updateSettings);

export default router;

