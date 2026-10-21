export type UserRole = "user" | "admin" | "vendor";

export type BusinessStatus = "pending" | "verified" | "rejected" | "suspended";
export type ProductStatus = "active" | "hidden" | "archived";
export type OrderStatus = "pending" | "processed" | "shipped" | "delivered" | "cancelled";
export type ItemStatus = "pending" | "shipped" | "delivered";
export type RefundStatus = "none" | "requested" | "processing" | "escalated" | "refunded" | "rejected";

export const businessStatusTransitions: Record<BusinessStatus, BusinessStatus[]> = {
  pending: ["verified", "rejected", "suspended"],
  verified: ["suspended", "rejected"],
  rejected: ["pending", "verified"],
  suspended: ["verified", "rejected", "pending"],
};

export const productStatusTransitions: Record<ProductStatus, ProductStatus[]> = {
  active: ["hidden", "archived"],
  hidden: ["active", "archived"],
  archived: ["active"],
};

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processed", "cancelled"],
  processed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const refundStatusTransitions: Record<RefundStatus, RefundStatus[]> = {
  none: ["requested", "rejected", "escalated"],
  requested: ["processing", "rejected", "escalated"],
  processing: ["refunded", "rejected", "escalated"],
  escalated: ["refunded", "rejected", "processing"],
  refunded: [],
  rejected: [],
};
