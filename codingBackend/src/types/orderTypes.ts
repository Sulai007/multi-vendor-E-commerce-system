export interface OrderItemAttributes {
    orderId: string;
    productId: string;
    businessId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    itemStatus?: "pending" | "shipped" | "delivered";
    refundStatus?: "none" | "requested" | "processing" | "refunded" | "rejected";
};

export interface OrderAttributes {
    id: string;
    customerId: string;
    orderStatus?: "pending" | "processed" | "shipped" | "delivered";
    paymentStatus?: "unpaid" | "paid" | "refunded";
    shippingAddress: string;
}

export interface OrderCreationAttributes extends Omit<OrderAttributes, 'id' | 'orderStatus' | 'paymentStatus'> {}