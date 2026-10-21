/**
 * @swagger
 * /api/admin:
 *   post:
 *     tags: [Admin]
 *     summary: Retrieve API request logs (legacy)
 *     description: Legacy alias for retrieving API logs. Prefer GET /api/admin/logs. Requires the administrator password in the request body.
 *     deprecated: true
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       '200': { description: API logs retrieved }
 *       '400': { description: Password missing or query invalid }
 *       '401': { description: Invalid administrator password or token }
 *       '403': { description: Administrator role required }
 * /api/admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Retrieve API request logs
 *     description: Returns paginated API request logs, ordered newest first. Requires the administrator password in the request body.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       '200': { description: API logs retrieved }
 *       '400': { description: Password missing or query invalid }
 *       '401': { description: Invalid administrator password or token }
 *       '403': { description: Administrator role required }
 *   post:
 *     tags: [Admin]
 *     summary: Retrieve API request logs (legacy)
 *     description: Legacy POST alias for GET /api/admin/logs.
 *     deprecated: true
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       '200': { description: API logs retrieved }
 *       '400': { description: Password missing or query invalid }
 *       '401': { description: Invalid administrator password or token }
 *       '403': { description: Administrator role required }
 * /api/admin/getlogs:
 *   post:
 *     tags: [Admin]
 *     summary: Retrieve API request logs (legacy)
 *     description: Legacy alias for retrieving API logs. Prefer GET /api/admin/logs.
 *     deprecated: true
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       '200': { description: API logs retrieved }
 *       '400': { description: Password missing or query invalid }
 *       '401': { description: Invalid administrator password or token }
 *       '403': { description: Administrator role required }
 * /api/admin/accessPassword:
 *   post:
 *     tags: [Admin]
 *     summary: Set the administrator access password
 *     description: Sets the password required for protected administrative operations.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password, example: AdminStrongP@ss1 }
 *     responses:
 *       '200': { description: Password set successfully }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users
 *     description: Returns paginated users, optionally filtered by role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, vendor, admin] }
 *     responses:
 *       '200': { description: Users retrieved }
 *       '400': { description: Invalid query parameters }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/users/{userId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200': { description: User retrieved }
 *       '400': { description: Invalid user ID }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: User not found }
 * /api/admin/users/{userId}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a user's role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, vendor, admin] }
 *     responses:
 *       '200': { description: User role updated }
 *       '400': { description: Invalid user ID or role }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: User not found }
 * /api/admin/users/{userId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Enable or disable a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       '200': { description: User status updated }
 *       '400': { description: Invalid user ID or status }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: User not found }
 * /api/admin/businesses:
 *   get:
 *     tags: [Admin]
 *     summary: List businesses
 *     description: Returns paginated businesses, optionally filtered by business status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, verified, rejected, suspended] }
 *     responses:
 *       '200': { description: Businesses retrieved }
 *       '400': { description: Invalid query parameters }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/businesses/{businessId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a business
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200': { description: Business retrieved }
 *       '400': { description: Invalid business ID }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Business not found }
 * /api/admin/businesses/{businessId}/verify:
 *   patch:
 *     tags: [Admin]
 *     summary: Verify or reject a business
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verified: { type: boolean, default: true }
 *     responses:
 *       '200': { description: Business verification updated }
 *       '400': { description: Invalid business ID or verification value }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Business not found }
 * /api/admin/businesses/{businessId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a business status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, verified, rejected, suspended] }
 *     responses:
 *       '200': { description: Business status updated }
 *       '400': { description: Invalid business ID or status }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Business not found }
 * /api/admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: List products
 *     description: Returns paginated products, optionally filtered by moderation status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, hidden, archived] }
 *     responses:
 *       '200': { description: Products retrieved }
 *       '400': { description: Invalid query parameters }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/products/{productId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200': { description: Product retrieved }
 *       '400': { description: Invalid product ID }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Product not found }
 * /api/admin/products/{productId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a product moderation status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, hidden, archived] }
 *     responses:
 *       '200': { description: Product status updated }
 *       '400': { description: Invalid product ID or status }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Product not found }
 * /api/admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: List orders
 *     description: Returns paginated orders, optionally filtered by order status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, processed, shipped, delivered, cancelled] }
 *     responses:
 *       '200': { description: Orders retrieved }
 *       '400': { description: Invalid query parameters }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/orders/{orderId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200': { description: Order retrieved }
 *       '400': { description: Invalid order ID }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Order not found }
 * /api/admin/orders/{orderId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Change an order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, processed, shipped, delivered, cancelled] }
 *     responses:
 *       '200': { description: Order status updated }
 *       '400': { description: Invalid order ID or status }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Order not found }
 * /api/admin/refund-requests:
 *   get:
 *     tags: [Admin]
 *     summary: List refund requests
 *     description: Returns paginated refund requests, optionally filtered by the linked order item's refund status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [none, requested, processing, escalated, refunded, rejected] }
 *     responses:
 *       '200': { description: Refund requests retrieved }
 *       '400': { description: Invalid query parameters }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/refund-requests/{refundRequestId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update a refund request status
 *     description: Changes the linked order item's refund status if the lifecycle transition is allowed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: refundRequestId
 *         required: true
 *         schema: { type: string, format: uuid }
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
 *       '200': { description: Refund status updated }
 *       '400': { description: Invalid request ID or status }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *       '404': { description: Refund request or order item not found }
 *       '409': { description: Invalid refund lifecycle transition }
 * /api/admin/dashboard/summary:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: Totals for users, businesses, products, orders, refunds, and revenue }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/metrics:
 *   get:
 *     tags: [Admin]
 *     summary: Get grouped system metrics
 *     description: Returns user, business, product, order, and refund counts grouped by their lifecycle state.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: System metrics retrieved }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 * /api/admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: List application settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: Settings retrieved }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 *   patch:
 *     tags: [Admin]
 *     summary: Create or update an application setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, value]
 *             properties:
 *               key: { type: string, example: support_email }
 *               value: { type: string, example: support@example.com }
 *     responses:
 *       '200': { description: Setting updated }
 *       '401': { description: Authentication required }
 *       '403': { description: Administrator role required }
 */
