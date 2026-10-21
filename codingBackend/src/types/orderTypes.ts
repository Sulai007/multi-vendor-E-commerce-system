import type { ItemStatus, OrderStatus, RefundStatus } from "./lifecycle";

export interface OrderItemAttributes {
    orderId: string;
    productId: string;
    businessId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    itemStatus?: ItemStatus;
    refundStatus?: RefundStatus;
};

export interface OrderAttributes {
    id: string;
    customerId: string;
    orderStatus?: OrderStatus;
    paymentStatus?: "unpaid" | "paid" | "refunded";
    shippingAddress: string;
}

export interface OrderCreationAttributes extends Omit<OrderAttributes, 'id' | 'orderStatus' | 'paymentStatus'> {}