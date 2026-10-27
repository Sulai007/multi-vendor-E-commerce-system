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
const validate_middleware_1 = require("../middleware/validate.middleware");
const paginationSchema_1 = require("../schema/paginationSchema");
const adminSchema_1 = require("../schema/adminSchema");
const router = (0, express_1.Router)();
router.get("/logs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(paginationSchema_1.paginationRequestSchema), requirePassword_1.requirePassword, logController.getApiLogs);
router.post("/accessPassword", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), logController.updatePassword);
router.get("/users", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getUsersSchema), logController.getUsers);
router.get("/users/:userId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getUserByIdSchema), logController.getUserById);
router.patch("/users/:userId/role", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.updateUserRoleSchema), logController.updateUserRole);
router.patch("/users/:userId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.updateUserStatusSchema), logController.updateUserStatus);
router.get("/businesses", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getBusinessesSchema), logController.getBusinessesForAdmin);
router.get("/businesses/:businessId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getBusinessByIdAdminSchema), logController.getBusinessByIdForAdmin);
router.patch("/businesses/:businessId/verify", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.verifyBusinessSchema), logController.verifyBusiness);
router.patch("/businesses/:businessId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.updateBusinessStatusSchema), logController.updateBusinessStatus);
router.get("/products", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getProductsSchema), logController.getProductsForAdmin);
router.get("/products/:productId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getProductByIdAdminSchema), logController.getProductByIdForAdmin);
router.patch("/products/:productId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.updateProductStatusSchema), logController.updateProductStatus);
router.get("/orders", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getOrdersSchema), logController.getOrdersAdmin);
router.get("/orders/:orderId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getOrderByIdAdminSchema), logController.getOrderByIdAdmin);
router.patch("/orders/:orderId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.updateAdminOrderStatusSchema), logController.updateAdminOrderStatus);
router.get("/refund-requests", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.getRefundRequestsAdminSchema), logController.getRefundRequestsAdmin);
router.patch("/refund-requests/:refundRequestId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(adminSchema_1.updateRefundStatusAdminSchema), logController.updateRefundStatusAdmin);
router.get("/dashboard/summary", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), logController.getDashboardSummary);
router.get("/metrics", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), logController.getMetrics);
router.get("/settings", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), logController.getSettings);
router.patch("/settings", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), logController.updateSettings);
exports.default = router;
