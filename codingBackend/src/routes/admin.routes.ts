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

router.get("/logs", authenticate, authorize("admin"), validate(paginationRequestSchema), requirePassword, logController.getApiLogs);
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

