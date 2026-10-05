/**
 * @swagger
 * /api/customer/get-businesses:
 *   get:
 *     tags: [Customer]
 *     summary: List available businesses
 *     description: Returns all vendor businesses available to customers.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '202':
 *         description: Businesses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Businesses retrieved successfulyy }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomerBusiness'
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '500':
 *         description: Businesses could not be fetched
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */

/**
 * @swagger
 * /api/customer/get-business/{businessId}:
 *   get:
 *     tags: [Customer]
 *     summary: Get a business
 *     description: Returns a vendor business by ID.
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
 *     responses:
 *       '202':
 *         description: Business fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Business fetched successfully }
 *                 data: { $ref: '#/components/schemas/CustomerBusiness' }
 *       '400':
 *         description: Invalid business ID
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '404':
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */

/**
 * @swagger
 * /api/customer/{businessId}/products:
 *   get:
 *     tags: [Customer]
 *     summary: List business products
 *     description: Returns the products in a business catalog.
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
 *     responses:
 *       '202':
 *         description: Business products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Business Products fetched successfully }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomerProduct'
 *       '400':
 *         description: Invalid business ID
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */

/**
 * @swagger
 * /api/customer/{businessId}/product/{productId}:
 *   get:
 *     tags: [Customer]
 *     summary: Get a business product
 *     description: Returns one product from a business catalog.
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
 *       - name: productId
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '202':
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Product fecthed successfully }
 *                 data: { $ref: '#/components/schemas/CustomerProduct' }
 *       '400':
 *         description: Invalid business or product ID
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */

/**
 * @swagger
 * /api/customer/create-order:
 *   post:
 *     tags: [Customer]
 *     summary: Create an order
 *     description: Creates an order for the authenticated customer from one or more products.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 1
 *             items:
 *               $ref: '#/components/schemas/CustomerOrderItemInput'
 *     responses:
 *       '200':
 *         description: Order successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Order successfully created }
 *                 data: { $ref: '#/components/schemas/CustomerOrder' }
 *       '400':
 *         description: Invalid order items or product out of stock
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */

/**
 * @swagger
 * /api/customer/{orderid}/{prodId}/add-to-order:
 *   post:
 *     tags: [Customer]
 *     summary: Add a product to an order
 *     description: Adds a product quantity to an existing order for the authenticated customer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderid
 *         in: path
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: prodId
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
 *             required: [qty]
 *             properties:
 *               qty: { type: integer, minimum: 1, example: 2 }
 *     responses:
 *       '200':
 *         description: Item successfully added to order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: item successfully added to Order }
 *                 data: { $ref: '#/components/schemas/CustomerOrderItem' }
 *       '400':
 *         description: Invalid quantity or product out of stock
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '401':
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 *       '404':
 *         description: Order or product not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiErrorResponse' }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerBusiness:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         businessName: { type: string, example: Jane's Market }
 *         description: { type: string, example: Fresh groceries and household goods }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CustomerProduct:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string, example: Organic Rice }
 *         businessId: { type: string, format: uuid }
 *         description: { type: string, example: Premium long-grain rice }
 *         price: { type: number, format: float, example: 25.99 }
 *         quantity: { type: integer, example: 50 }
 *         imageUrl: { type: string, format: uri, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CustomerOrderItemInput:
 *       type: object
 *       required: [productId, qty]
 *       properties:
 *         productId: { type: string, format: uuid }
 *         qty: { type: integer, minimum: 1, example: 2 }
 *     CustomerOrder:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         customerId: { type: string, format: uuid }
 *         totalAmount: { type: number, format: float, example: 51.98 }
 *         orderStatus: { type: string, enum: [pending, processed, shipped, delivered] }
 *         paymentStatus: { type: string, enum: [unpaid, paid] }
 *         shippingAddress: { type: string, example: 12 Market Street }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CustomerOrderItem:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         orderId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         businessId: { type: string, format: uuid }
 *         name: { type: string, example: Organic Rice }
 *         quantity: { type: integer, example: 2 }
 *         unitPrice: { type: number, format: float, example: 25.99 }
 *         itemStatus: { type: string, enum: [pending, shipped, delivered] }
 *         refundStatus: { type: string, enum: [none, requested, processing, refunded, rejected] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
