import { z } from "zod";
import { paginationQuerySchema } from "./paginationSchema";

const uuidField = z.string().trim().uuid("A valid ID is required");

export const getUsersSchema = z.object({
  query: paginationQuerySchema.extend({
    role: z.enum(["user", "admin", "vendor"]).optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    userId: uuidField,
  }),
  body: z.object({
    role: z.enum(["user", "admin", "vendor"]),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    userId: uuidField,
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const getBusinessesSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["pending", "verified", "rejected", "suspended"]).optional(),
  }),
});

export const verifyBusinessSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
  body: z.object({
    verified: z.boolean().optional().default(true),
  }),
});

export const updateBusinessStatusSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
  body: z.object({
    status: z.enum(["pending", "verified", "rejected", "suspended"]),
  }),
});

export const getProductsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["active", "hidden", "archived"]).optional(),
  }),
});

export const updateProductStatusSchema = z.object({
  params: z.object({
    productId: uuidField,
  }),
  body: z.object({
    status: z.enum(["active", "hidden", "archived"]),
  }),
});

export const getOrdersSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["pending", "processed", "shipped", "delivered", "cancelled"]).optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    userId: uuidField,
  }),
});

export const getBusinessByIdAdminSchema = z.object({
  params: z.object({
    businessId: uuidField,
  }),
});

export const getProductByIdAdminSchema = z.object({
  params: z.object({
    productId: uuidField,
  }),
});

export const getOrderByIdAdminSchema = z.object({
  params: z.object({
    orderId: uuidField,
  }),
});

export const updateAdminOrderStatusSchema = z.object({
  params: z.object({
    orderId: uuidField,
  }),
  body: z.object({
    status: z.enum(["pending", "processed", "shipped", "delivered", "cancelled"]),
  }),
});

export const getRefundRequestsAdminSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["none", "requested", "processing", "escalated", "refunded", "rejected"]).optional(),
  }),
});

export const updateRefundStatusAdminSchema = z.object({
  params: z.object({
    refundRequestId: uuidField,
  }),
  body: z.object({
    status: z.enum(["processing", "escalated", "refunded", "rejected"]),
  }),
});
