import { z } from "zod";
import { paginationQuerySchema } from "./paginationSchema";

const uuidField = z.string().trim().uuid("A valid ID is required");

export const getBusinessSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
});

export const getBusinessProductsSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
  query: paginationQuerySchema,
});

export const getProductsByCategorySchema = z.object({
  params: z.object({
    categoryId: uuidField,
  }),
  query: paginationQuerySchema,
});

export const getBusinessesSchema = z.object({
  query: paginationQuerySchema,
});

export const searchProductsSchema = z.object({
  query: paginationQuerySchema.extend({
    q: z.string().trim().min(1, "Search text is required").max(100),
  }),
});

export const getBusinessProductSchema = z.object({
  params: z.object({
    businessId: uuidField,
    productId: uuidField,
  }),
});

const orderItemSchema = z.object({
  productId: uuidField,
  qty: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  body: z.array(orderItemSchema).min(1, "At least one order item is required"),
});

export const addToOrderSchema = z.object({
  params: z.object({
    orderid: uuidField,
    prodId: uuidField,
  }),
  body: z.object({
    qty: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
  }),
});

export const requestRefundSchema = z.object({
  params: z.object({
    orderItemId: uuidField,
  }),
  body: z.object({
    reasonNote: z.string().trim().min(1, "A refund reason is required").max(1000),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    orderId: uuidField,
  }),
  body: z.object({
    reason: z.string().trim().max(500).optional(),
  }),
});