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
const vendorController = __importStar(require("../controllers/vendorController"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const idempotency_1 = require("../middleware/idempotency");
const fileUpolad_1 = require("../helper/fileUpolad");
const vendorSchema_1 = require("../schema/vendorSchema");
const router = (0, express_1.Router)();
// router.use(authenticate, authorize)
router.post("/register", auth_middleware_1.authenticate, idempotency_1.idempotencyMiddleware, vendorController.createBusiness);
router.get("/profile/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor", "admin"), (0, validate_middleware_1.validate)(vendorSchema_1.getBusinessProfileSchema), vendorController.getBusinessProfile);
router.patch("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.updateBusinessSchema), idempotency_1.idempotencyMiddleware, vendorController.updateBusiness);
router.post("/:businessId/add-products", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), fileUpolad_1.fileUploader.single("image"), (0, validate_middleware_1.validate)(vendorSchema_1.addProductSchema), idempotency_1.idempotencyMiddleware, vendorController.addProduct);
router.get("/:businessId/products", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor", "admin"), (0, validate_middleware_1.validate)(vendorSchema_1.getBusinessProductsSchema), vendorController.getBusinessProducts);
router.patch("/:businessId/products/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.updateProductSchema), idempotency_1.idempotencyMiddleware, vendorController.updateProduct);
router.delete("/:businessId/products/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.deleteProductSchema), idempotency_1.idempotencyMiddleware, vendorController.deleteProduct);
router.get("/:businessId/orders", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.getBusinessOrdersSchema), vendorController.getOrderByStatus);
router.patch("/:businessId/orders/:itemId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.updateOrderStatusSchema), idempotency_1.idempotencyMiddleware, vendorController.updateOrderStatus);
router.get("/:businessId/refund-requests", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.getRefundRequestsSchema), vendorController.getRefundRequests);
router.patch("/:businessId/refund-requests/:refundRequestId/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("vendor"), (0, validate_middleware_1.validate)(vendorSchema_1.updateRefundStatusSchema), idempotency_1.idempotencyMiddleware, vendorController.updateRefundStatus);
exports.default = router;
