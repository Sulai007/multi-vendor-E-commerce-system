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
const customerController = __importStar(require("../controllers/customerController"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const idempotency_1 = require("../middleware/idempotency");
const customerSchema_1 = require("../schema/customerSchema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/get-businesses", (0, validate_middleware_1.validate)(customerSchema_1.getBusinessesSchema), customerController.getBusinesses);
router.get("/search-products", (0, validate_middleware_1.validate)(customerSchema_1.searchProductsSchema), customerController.searchProducts);
router.get("/category/:categoryId/products", (0, validate_middleware_1.validate)(customerSchema_1.getProductsByCategorySchema), customerController.getProductsByCategory);
router.get("/get-business/:businessId", (0, validate_middleware_1.validate)(customerSchema_1.getBusinessSchema), customerController.getBusinessById);
router.get("/:businessId/products", (0, validate_middleware_1.validate)(customerSchema_1.getBusinessProductsSchema), customerController.getBusinessProducts);
router.get("/:businessId/product/:productId", (0, validate_middleware_1.validate)(customerSchema_1.getBusinessProductSchema), customerController.getBusinessProductById);
router.post("/create-order", (0, validate_middleware_1.validate)(customerSchema_1.createOrderSchema), idempotency_1.idempotencyMiddleware, customerController.createOrder);
router.patch("/orders/:orderId/cancel", (0, validate_middleware_1.validate)(customerSchema_1.cancelOrderSchema), idempotency_1.idempotencyMiddleware, customerController.cancelOrder);
router.post("/:orderid/:prodId/add-to-order", (0, validate_middleware_1.validate)(customerSchema_1.addToOrderSchema), idempotency_1.idempotencyMiddleware, customerController.addToOrder);
router.post("/order-items/:orderItemId/refund-requests", (0, validate_middleware_1.validate)(customerSchema_1.requestRefundSchema), idempotency_1.idempotencyMiddleware, customerController.requestRefund);
exports.default = router;
