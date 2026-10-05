import { Router } from "express";
import * as customerController from "../controllers/customerController";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency";
import {
	addToOrderSchema,
	createOrderSchema,
	getBusinessProductSchema,
	getBusinessProductsSchema,
	getBusinessSchema,
} from "../schema/customerSchema";


const router = Router()
router.use(authenticate)

router.get("/get-businesses", customerController.getBusinesses)

router.get("/get-business/:businessId", validate(getBusinessSchema), customerController.getBusinessById )

router.get("/:businessId/products", validate(getBusinessProductsSchema), customerController.getBusinessProducts)

router.get("/:businessId/product/:productId", validate(getBusinessProductSchema), customerController.getBusinessProductById)

router.post("/create-order", validate(createOrderSchema), idempotencyMiddleware, customerController.createOrder )

router.post("/:orderid/:prodId/add-to-order", validate(addToOrderSchema), idempotencyMiddleware, customerController.addToOrder)


























export default router;

