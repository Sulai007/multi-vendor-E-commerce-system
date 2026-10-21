import { Router } from "express";
import * as vendorController from "../controllers/vendorController";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency";
import { fileUploader } from "../helper/fileUpolad";
import {
    addProductSchema,
    createBusinessSchema,
    deleteProductSchema,
    getBusinessProductsSchema,
    getBusinessOrdersSchema,
    getRefundRequestsSchema,
    getBusinessProfileSchema,
    updateBusinessSchema,
    updateOrderStatusSchema,
    updateRefundStatusSchema,
    updateProductSchema,
} from "../schema/vendorSchema";

const router = Router();

// router.use(authenticate, authorize)

router.post("/register", authenticate, idempotencyMiddleware, vendorController.createBusiness);

router.get("/profile/:id", authenticate, authorize("vendor", "admin"), validate(getBusinessProfileSchema), vendorController.getBusinessProfile);

router.patch("/:id", authenticate, authorize("vendor"), validate(updateBusinessSchema), idempotencyMiddleware, vendorController.updateBusiness);

router.post("/:businessId/add-products", authenticate, authorize("vendor"), fileUploader.single("image"), validate(addProductSchema), idempotencyMiddleware, vendorController.addProduct);

router.get("/:businessId/products", authenticate, authorize("vendor", "admin"), validate(getBusinessProductsSchema), vendorController.getBusinessProducts);

router.patch("/:businessId/products/:id", authenticate, authorize("vendor"), validate(updateProductSchema), idempotencyMiddleware, vendorController.updateProduct);

router.delete("/:businessId/products/:id", authenticate, authorize("vendor"), validate(deleteProductSchema), idempotencyMiddleware, vendorController.deleteProduct);

router.get("/:businessId/orders", authenticate, authorize("vendor"), validate(getBusinessOrdersSchema), vendorController.getOrderByStatus)

router.patch("/:businessId/orders/:itemId/status", authenticate, authorize("vendor"), validate(updateOrderStatusSchema), idempotencyMiddleware, vendorController.updateOrderStatus);

router.get("/:businessId/refund-requests", authenticate, authorize("vendor"), validate(getRefundRequestsSchema), vendorController.getRefundRequests);

router.patch("/:businessId/refund-requests/:refundRequestId/status", authenticate, authorize("vendor"), validate(updateRefundStatusSchema), idempotencyMiddleware, vendorController.updateRefundStatus);

export default router;

