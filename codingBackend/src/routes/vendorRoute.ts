import { Router } from "express";
import * as vendorController from "../controllers/vendorController";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { fileUploader } from "../helper/fileUpolad";
import {
    addProductSchema,
    createBusinessSchema,
    deleteProductSchema,
    getBusinessProductsSchema,
    getBusinessProfileSchema,
    updateBusinessSchema,
    updateProductSchema,
} from "../schema/vendorSchema";

const router = Router();

// router.use(authenticate, authorize)

/**
 * @swagger
 * /api/business/register:
 *   post:
 *     tags: [Business]
 *     summary: Register a vendor
 *     description: Creates a vendor profile for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, description]
 *             properties:
 *               businessName: { type: string, example: Jane's Market }
 *               description: { type: string, example: Fresh groceries and household goods }
 *     responses:
 *       '200':
 *         description: Vendor business registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Vendor registered successfully. }
 *                 data: { type: string, example: Vendor registered successfully. }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Vendor registration failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/register", authenticate, vendorController.createBusiness);

/**
 * @swagger
 * /api/business/profile/{id}:
 *   get:
 *     tags: [Business]
 *     summary: Get vendor profile
 *     description: Returns the requested vendor profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Business ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Vendor fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Vendor fetched successfully. }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       userId: { type: string, format: uuid }
 *                       businessName: { type: string, example: Jane's Market }
 *                       description: { type: string, example: Fresh groceries and household goods }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Vendors could not be fetched
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.get("/profile/:id", authenticate, authorize("vendor", "admin"), validate(getBusinessProfileSchema), vendorController.getBusinessProfile);

/**
 * @swagger
 * /api/business/{id}:
 *   patch:
 *     tags: [Business]
 *     summary: Update a vendor profile
 *     description: Updates one or more vendor business fields for the authenticated vendor user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Vendor business ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName: { type: string, example: Jane's Market }
 *               description: { type: string, example: Fresh groceries and household goods }
 *     responses:
 *       '200':
 *         description: Vendor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Vendor updated successfully. }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     userId: { type: string, format: uuid }
 *                     businessName: { type: string, example: Jane's Market }
 *                     description: { type: string, example: Fresh groceries and household goods }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *       '400':
 *         description: No valid update fields were provided
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Vendor update failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.patch("/:id", authenticate, authorize("vendor"), validate(updateBusinessSchema), vendorController.updateBusiness);


/**
 * @swagger
 * /api/business/{businessId}/add-products:
 *   post:
 *     tags: [Business]
 *     summary: Add a product to the business catalog
 *     description: Uploads a product image and creates a product for the authenticated business user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         description: Business ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, quantity, image]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Organic Rice
 *               description:
 *                 type: string
 *                 example: Premium long-grain rice
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 25.99
 *               quantity:
 *                 type: integer
 *                 example: 50
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *     responses:
 *       '201':
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Product added successfully. }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     name: { type: string, example: Organic Rice }
 *                     description: { type: string, example: Premium long-grain rice }
 *                     price: { type: number, example: 25.99 }
 *                     quantity: { type: integer, example: 50 }
 *                     imageUrl: { type: string, format: uri, nullable: true }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *       '400':
 *         description: Missing required product fields or image file
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Product creation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.post("/:businessId/add-products", authenticate, authorize("vendor"), fileUploader.single("image"), validate(addProductSchema), vendorController.addProduct);

/**
 * @swagger
 * /api/business/{businessId}/products:
 *   get:
 *     tags: [Business]
 *     summary: Get products for a business
 *     description: Returns all products belonging to the specified business.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         description: Business ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Vendor products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Vendor products fetched successfully. }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       name: { type: string, example: Organic Rice }
 *                       vendorID: { type: string, format: uuid }
 *                       description: { type: string, example: Premium long-grain rice }
 *                       imageUrl: { type: string, format: uri, nullable: true }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Products could not be fetched
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.get("/:businessId/products", authenticate, authorize("vendor", "admin"), validate(getBusinessProductsSchema), vendorController.getBusinessProducts);



/**
 * @swagger
 * /api/business/{businessId}/products/{id}:
 *   patch:
 *     tags: [Business]
 *     summary: Update a vendor product
 *     description: Updates one or more fields of a product owned by the specified vendor business.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         description: Vendor business ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name: { type: string, example: Organic Brown Rice }
 *               description: { type: string, example: Premium long-grain brown rice }
 *               price: { type: number, format: float, example: 29.99 }
 *               quantity: { type: integer, minimum: 1, example: 40 }
 *     responses:
 *       '200':
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: product updated successfully }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     name: { type: string, example: Organic Brown Rice }
 *                     businessId: { type: string, format: uuid }
 *                     description: { type: string, example: Premium long-grain brown rice }
 *                     price: { type: number, format: float, example: 29.99 }
 *                     quantity: { type: integer, example: 40 }
 *                     imageUrl: { type: string, format: uri, nullable: true }
 *                     imagePublicId: { type: string, nullable: true }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *       '400':
 *         description: No valid product fields were provided
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Product update failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.patch("/:businessId/products/:id", authenticate, authorize("vendor"), validate(updateProductSchema), vendorController.updateProduct);



/**
 * @swagger
 * /api/business/{businessId}/products/{id}:
 *   delete:
 *     tags: [Business]
 *     summary: Delete a vendor product
 *     description: Deletes a product owned by the specified vendor business.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         description: Business ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: product deleted successfully }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     name: { type: string, example: Organic Rice }
 *                     businessId: { type: string, format: uuid }
 *                     description: { type: string, example: Premium long-grain rice }
 *                     price: { type: number, format: float, example: 25.99 }
 *                     quantity: { type: integer, example: 50 }
 *                     imageUrl: { type: string, format: uri, nullable: true }
 *                     imagePublicId: { type: string, nullable: true }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Product deletion failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
router.delete("/:businessId/products/:id", authenticate, authorize("vendor"), validate(deleteProductSchema), vendorController.deleteProduct);



export default router;

