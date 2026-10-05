"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToOrderSchema = exports.createOrderSchema = exports.getBusinessProductSchema = exports.getBusinessProductsSchema = exports.getBusinessSchema = void 0;
const zod_1 = require("zod");
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
