import { z } from "zod";

const uuidField = z.string().trim().uuid("A valid ID is required");

const businessNameField = z
  .string()
  .trim()
  .min(1, "Business name is required")
  .max(255, "Business name must not exceed 255 characters");

const descriptionField = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(255, "Description must not exceed 255 characters");

const productNameField = z
  .string()
  .trim()
  .min(1, "Product name is required")
  .max(255, "Product name must not exceed 255 characters");

const productDescriptionField = z
  .string()
  .trim()
  .min(1, "Product description is required")
  .max(255, "Product description must not exceed 255 characters");

export const createBusinessSchema = z.object({
  body: z.object({
    businessName: businessNameField,
    description: descriptionField,
  }),
});

export const getBusinessProfileSchema = z.object({
  params: z.object({
    id: uuidField,
  }),
});

export const updateBusinessSchema = z.object({
  params: z.object({
    id: uuidField,
  }),
  body: z
    .object({
      businessName: businessNameField.optional(),
      description: descriptionField.optional(),
    })
    .refine((data) => data.businessName || data.description, {
      message: "At least one field (businessName or description) is required",
      path: ["businessName"],
    }),
});

export const addProductSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
  body: z.object({
    name: productNameField,
    description: productDescriptionField,
    price: z.coerce.number().positive("Price must be greater than 0"),
    quantity: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1"),
  }),
});

export const getBusinessProductsSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    businessId: uuidField,
    id: uuidField,
  }),
  body: z
    .object({
      name: productNameField.optional(),
      description: productDescriptionField.optional(),
      price: z.coerce.number().positive("Price must be greater than 0").optional(),
      quantity: z.coerce
        .number()
        .int("Quantity must be an integer")
        .min(1, "Quantity must be at least 1")
        .optional(),
    })
    .refine((data) => data.name || data.description || data.price !== undefined || data.quantity !== undefined, {
      message: "At least one product field must be provided for update",
      path: ["name"],
    }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    businessId: uuidField,
    id: uuidField,
  }),
});
