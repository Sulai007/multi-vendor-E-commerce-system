import { Router } from "express";
import * as customerController from "../controllers/customerController";
import { authenticate, authorize } from "../middleware/auth.middleware";


const router = Router()
router.use(authenticate)

router.get("/get-businesses", customerController.getBusinesses)

router.get("/get-business/:businessId", customerController.getBusinessById )

router.get("/:businessId/products", customerController.getBusinessProducts)

router.get("/:businessId/product/:productId", customerController.getBusinessProductById)

router.post("/create-order", )


























export default router;

