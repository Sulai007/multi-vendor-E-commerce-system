"use strict";
/**
 * @swagger
 * /api/business/register:
 *   post:
 *     tags: [Business]
 *     summary: Register a vendor
 *     description: Creates a vendor profile for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdempotencyKey'
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
 *       - $ref: '#/components/parameters/IdempotencyKey'
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
 *       - $ref: '#/components/parameters/IdempotencyKey'
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
 *               categoryIds:
 *                 type: array
 *                 description: Optional product category UUIDs. Multipart clients may send a comma-separated string.
 *                 items: { type: string, format: uuid }
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
 *                     categoryNames:
 *                       type: array
 *                       items: { type: string }
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
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
/**
 * @swagger
 * /api/business/{businessId}/orders:
 *   get:
 *     tags: [Business]
 *     summary: List business order items
 *     description: Returns order items for a business, optionally filtered by status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, shipped, delivered] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       '200':
 *         description: Order items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items: { type: object }
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '400':
 *         description: Invalid business ID or order status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
/**
 * @swagger
 * /api/business/{businessId}/orders/{itemId}/status:
 *   patch:
 *     tags: [Business]
 *     summary: Update a business order item's status
 *     description: Updates the status of an order item belonging to the specified business. Repeating the same request with the same key replays its original response.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: Order item ID
 *         schema: { type: string, format: uuid }
 *       - $ref: '#/components/parameters/IdempotencyKey'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, shipped, delivered], example: shipped }
 *     responses:
 *       '200':
 *         description: Order item status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Order status updated successfully. }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     orderId: { type: string, format: uuid }
 *                     productId: { type: string, format: uuid }
 *                     businessId: { type: string, format: uuid }
 *                     itemStatus: { type: string, enum: [pending, shipped, delivered] }
 *       '400':
 *         description: Invalid IDs or status, or a missing or invalid Idempotency-Key header
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string, example: A valid Idempotency-Key header is required }
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
 *       '404':
 *         description: Order item not found for this business
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '409':
 *         description: The key was reused with a different request, or the original request is still processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     differentRequest:
 *                       value: Idempotency key was already used with a different request
 *                     stillProcessing:
 *                       value: A request with this idempotency key is still processing
 */
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
 *       - $ref: '#/components/parameters/IdempotencyKey'
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
 *               categoryIds:
 *                 type: array
 *                 description: Replaces the product's category assignments when provided.
 *                 items: { type: string, format: uuid }
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
 *                     categoryNames:
 *                       type: array
 *                       items: { type: string }
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
 *       - $ref: '#/components/parameters/IdempotencyKey'
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
/**
 * @swagger
 * /api/business/{businessId}/refund-requests:
 *   get:
 *     tags: [Business]
 *     summary: List refund requests for a business
 *     description: Returns paginated refund requests belonging to the authenticated vendor's business, optionally filtered by refund status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [requested, processing, refunded, rejected] }
 *       - name: page
 *         in: query
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       '200':
 *         description: Refund requests retrieved
 *       '400':
 *         description: Invalid business ID, status, or pagination parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor or does not own the business
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
/**
 * @swagger
 * /api/business/{businessId}/refund-requests/{refundRequestId}/status:
 *   patch:
 *     tags: [Business]
 *     summary: Update a refund request status
 *     description: Moves a refund request to an allowed next lifecycle state for the authenticated vendor's business.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - name: refundRequestId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - $ref: '#/components/parameters/IdempotencyKey'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [processing, escalated, refunded, rejected] }
 *     responses:
 *       '200':
 *         description: Refund status updated
 *       '400':
 *         description: Invalid IDs or refund status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '403':
 *         description: User is not authorized as a vendor or does not own the business
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '404':
 *         description: Refund request not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '409':
 *         description: Requested status is not a valid lifecycle transition
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */
