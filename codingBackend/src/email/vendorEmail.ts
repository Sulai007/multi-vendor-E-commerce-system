import type { ProductStatus } from "../types/lifecycle";
import { sendEmail } from "./mailDelivery";

type OrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
};

const formatAmount = (amount: number) => amount.toFixed(2);

const formatOrderLines = (items: OrderLine[]) => items
  .map((item) => `- ${item.quantity} x ${item.name} at ${formatAmount(item.unitPrice)} each`)
  .join("\n");

export const sendVendorNewOrderEmail = async (data: {
  to: string;
  vendorName: string;
  businessName: string;
  orderId: string;
  items: OrderLine[];
  totalAmount: number;
  shippingAddress: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `New order for ${data.businessName}: ${data.orderId}`,
    text: `Hello ${data.vendorName},

Your business has received new order items. Please sign in to review and prepare them.

Business: ${data.businessName}
Order: ${data.orderId}
Items:
${formatOrderLines(data.items)}
Items total: ${formatAmount(data.totalAmount)}
Delivery address: ${data.shippingAddress}

The Marketplace Team`,
  });
};

export const sendVendorOrderCancellationEmail = async (data: {
  to: string;
  vendorName: string;
  businessName: string;
  orderId: string;
  items: string[];
  reason?: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Order cancellation for ${data.businessName}: ${data.orderId}`,
    text: `Hello ${data.vendorName},

An order containing items from ${data.businessName} was cancelled.

Order: ${data.orderId}
Affected items: ${data.items.join(", ")}
${data.reason ? `Reason: ${data.reason}\n` : ""}
Sign in to your vendor account to review the order.

The Marketplace Team`,
  });
};

export const sendVendorRefundRequestEmail = async (data: {
  to: string;
  vendorName: string;
  businessName: string;
  customerName: string;
  refundRequestId: string;
  itemName: string;
  reasonNote: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Refund request needs review: ${data.itemName}`,
    text: `Hello ${data.vendorName},

A customer has requested a refund for an item associated with ${data.businessName}. Please review the request in your vendor account.

Request: ${data.refundRequestId}
Customer: ${data.customerName}
Item: ${data.itemName}
Customer's reason: ${data.reasonNote}

The Marketplace Team`,
  });
};

export const sendVendorProductStatusEmail = async (data: {
  to: string;
  vendorName: string;
  businessName: string;
  productName: string;
  status: ProductStatus;
  note?: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Product status update: ${data.productName}`,
    text: `Hello ${data.vendorName},

An administrator changed the status of a product in ${data.businessName}.

Product: ${data.productName}
Current status: ${data.status}
${data.note ? `\nUpdate note: ${data.note}\n` : ""}
Sign in to your vendor account to review the product and its availability.

The Marketplace Team`,
  });
};
