"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductSchema = exports.updateProductSchema = exports.updateOrderStatusSchema = exports.updateRefundStatusSchema = exports.getRefundRequestsSchema = exports.getBusinessOrdersSchema = exports.getBusinessProductsSchema = exports.addProductSchema = exports.updateBusinessSchema = exports.getBusinessProfileSchema = exports.createBusinessSchema = void 0;
const zod_1 = require("zod");
const paginationSchema_1 = require("./paginationSchema");
const uuidField = zod_1.z.string().trim().uuid("A valid ID is required");
const businessNameField = zod_1.z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(255, "Business name must not exceed 255 characters");
const descriptionField = zod_1.z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description must not exceed 255 characters");
const productNameField = zod_1.z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name must not exceed 255 characters");
const productDescriptionField = zod_1.z
    .string()
    .trim()
    .min(1, "Product description is required")
    .max(255, "Product description must not exceed 255 characters");
exports.createBusinessSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: businessNameField,
        description: descriptionField,
    }),
});
exports.getBusinessProfileSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: uuidField,
    }),
});
exports.updateBusinessSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: uuidField,
    }),
    body: zod_1.z
        .object({
        businessName: businessNameField.optional(),
        description: descriptionField.optional(),
    })
        .refine((data) => data.businessName || data.description, {
        message: "At least one field (businessName or description) is required",
        path: ["businessName"],
    }),
});
exports.addProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
    }),
    body: zod_1.z.object({
        name: productNameField,
        description: productDescriptionField,
        price: zod_1.z.coerce.number().positive("Price must be greater than 0"),
        quantity: zod_1.z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
        categoryIds: zod_1.z.preprocess((value) => typeof value === "string" ? value.split(",").map((id) => id.trim()).filter(Boolean) : value, zod_1.z.array(uuidField).optional()),
    }),
});
exports.getBusinessProductsSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
    }),
    query: paginationSchema_1.paginationQuerySchema,
});
exports.getBusinessOrdersSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
    }),
    query: paginationSchema_1.paginationQuerySchema.extend({
        status: zod_1.z.enum(["pending", "shipped", "delivered"]).optional(),
    }),
});
exports.getRefundRequestsSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
    }),
    query: paginationSchema_1.paginationQuerySchema.extend({
        status: zod_1.z.enum(["requested", "processing", "refunded", "rejected"]).optional(),
    }),
});
exports.updateRefundStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
        refundRequestId: uuidField,
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(["processing", "escalated", "refunded", "rejected"]),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
        itemId: uuidField,
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(["pending", "shipped", "delivered"]),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
        id: uuidField,
    }),
    body: zod_1.z
        .object({
        name: productNameField.optional(),
        description: productDescriptionField.optional(),
        price: zod_1.z.coerce.number().positive("Price must be greater than 0").optional(),
        quantity: zod_1.z.coerce
            .number()
            .int("Quantity must be an integer")
            .min(1, "Quantity must be at least 1")
            .optional(),
        categoryIds: zod_1.z.preprocess((value) => typeof value === "string" ? value.split(",").map((id) => id.trim()).filter(Boolean) : value, zod_1.z.array(uuidField).optional()),
    })
        .refine((data) => data.name || data.description || data.price !== undefined || data.quantity !== undefined || data.categoryIds !== undefined, {
        message: "At least one product field must be provided for update",
        path: ["name"],
    }),
});
exports.deleteProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        businessId: uuidField,
        id: uuidField,
    }),
});
