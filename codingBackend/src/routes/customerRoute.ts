import { Router } from "express";
import * as customerController from "../controllers/customerController";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency";
import {
	addToOrderSchema,
	cancelOrderSchema,
	createOrderSchema,
	getBusinessProductSchema,
	getBusinessProductsSchema,
	getProductsByCategorySchema,
	getBusinessesSchema,
	getBusinessSchema,
	searchProductsSchema,
	requestRefundSchema,
} from "../schema/customerSchema";


const router = Router()
router.use(authenticate)

router.get("/get-businesses", validate(getBusinessesSchema), customerController.getBusinesses)

router.get("/search-products", validate(searchProductsSchema), customerController.searchProducts)

router.get("/category/:categoryId/products", validate(getProductsByCategorySchema), customerController.getProductsByCategory)

router.get("/get-business/:businessId", validate(getBusinessSchema), customerController.getBusinessById )

router.get("/:businessId/products", validate(getBusinessProductsSchema), customerController.getBusinessProducts)

router.get("/:businessId/product/:productId", validate(getBusinessProductSchema), customerController.getBusinessProductById)

router.post("/create-order", validate(createOrderSchema), idempotencyMiddleware, customerController.createOrder )

router.patch("/orders/:orderId/cancel", validate(cancelOrderSchema), idempotencyMiddleware, customerController.cancelOrder)

router.post("/:orderid/:prodId/add-to-order", validate(addToOrderSchema), idempotencyMiddleware, customerController.addToOrder)

router.post("/order-items/:orderItemId/refund-requests", validate(requestRefundSchema), idempotencyMiddleware, customerController.requestRefund)


























export default router;

