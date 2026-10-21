"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderSchema = exports.requestRefundSchema = exports.addToOrderSchema = exports.createOrderSchema = exports.getBusinessProductSchema = exports.searchProductsSchema = exports.getBusinessesSchema = exports.getProductsByCategorySchema = exports.getBusinessProductsSchema = exports.getBusinessSchema = void 0;
const zod_1 = require("zod");
const paginationSchema_1 = require("./paginationSchema");
const uuidField = zod_1.z.string().trim().uuid("A valid ID is required");
exports.getBusinessSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
    }),
});
exports.getBusinessProductsSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
    }),
    query: paginationSchema_1.paginationQuerySchema,
});
exports.getProductsByCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        categoryId: uuidField,
    }),
    query: paginationSchema_1.paginationQuerySchema,
});
exports.getBusinessesSchema = zod_1.z.object({
    query: paginationSchema_1.paginationQuerySchema,
});
exports.searchProductsSchema = zod_1.z.object({
    query: paginationSchema_1.paginationQuerySchema.extend({
        q: zod_1.z.string().trim().min(1, "Search text is required").max(100),
    }),
});
exports.getBusinessProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
        productId: uuidField,
    }),
});
const orderItemSchema = zod_1.z.object({
    productId: uuidField,
    qty: zod_1.z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
});
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.array(orderItemSchema).min(1, "At least one order item is required"),
});
exports.addToOrderSchema = zod_1.z.object({
    params: zod_1.z.object({
        orderid: uuidField,
        prodId: uuidField,
    }),
    body: zod_1.z.object({
        qty: zod_1.z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
    }),
});
exports.requestRefundSchema = zod_1.z.object({
    params: zod_1.z.object({
        orderItemId: uuidField,
    }),
    body: zod_1.z.object({
        reasonNote: zod_1.z.string().trim().min(1, "A refund reason is required").max(1000),
    }),
});
exports.cancelOrderSchema = zod_1.z.object({
    params: zod_1.z.object({
        orderId: uuidField,
    }),
    body: zod_1.z.object({
        reason: zod_1.z.string().trim().max(500).optional(),
    }),
});
