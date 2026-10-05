import { z } from "zod";

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