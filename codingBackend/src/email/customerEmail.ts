import type { ItemStatus, OrderStatus, RefundStatus } from "../types/lifecycle";
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

export const sendCustomerOrderConfirmationEmail = async (data: {
  to: string;
  firstName: string;
  orderId: string;
  items: OrderLine[];
  totalAmount: number;
  shippingAddress: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Order confirmed: ${data.orderId}`,
    text: `Hello ${data.firstName},

Your order has been placed successfully. Here is a summary for your records.

Order: ${data.orderId}
Items:
${formatOrderLines(data.items)}
Total: ${formatAmount(data.totalAmount)}
Delivery address: ${data.shippingAddress}

You can check the latest order status by signing in to your account.

Thank you for shopping with us,
The Marketplace Team`,
  });
};

export const sendCustomerOrderStatusEmail = async (data: {
  to: string;
  firstName: string;
  orderId: string;
  itemName?: string;
  status: ItemStatus | OrderStatus;
}) => {
  const subjectItem = data.itemName ? `: ${data.itemName}` : "";
  await sendEmail({
    to: data.to,
    subject: `Order update${subjectItem} - ${data.status}`,
    text: `Hello ${data.firstName},

There is an update to your order.

Order: ${data.orderId}
${data.itemName ? `Item: ${data.itemName}\n` : ""}Current status: ${data.status}

Sign in to your account to review the order details.

The Marketplace Team`,
  });
};

export const sendCustomerOrderCancellationEmail = async (data: {
  to: string;
  firstName: string;
  orderId: string;
  reason?: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Order cancelled: ${data.orderId}`,
    text: `Hello ${data.firstName},

Your order ${data.orderId} has been cancelled.
${data.reason ? `\nReason: ${data.reason}\n` : ""}
Sign in to your account to review the order details. If you did not request this cancellation, contact the marketplace support team.

The Marketplace Team`,
  });
};

export const sendCustomerRefundRequestReceivedEmail = async (data: {
  to: string;
  firstName: string;
  refundRequestId: string;
  itemName: string;
  reasonNote: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Refund request received: ${data.itemName}`,
    text: `Hello ${data.firstName},

We received your refund request. The business will review it and the request status will be updated in your account.

Request: ${data.refundRequestId}
Item: ${data.itemName}
Your reason: ${data.reasonNote}

We will email you when the status changes.

The Marketplace Team`,
  });
};

export const sendCustomerRefundStatusEmail = async (data: {
  to: string;
  firstName: string;
  refundRequestId: string;
  itemName: string;
  status: RefundStatus;
  note?: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Refund request update: ${data.itemName} - ${data.status}`,
    text: `Hello ${data.firstName},

The status of your refund request has changed.

Request: ${data.refundRequestId}
Item: ${data.itemName}
Current status: ${data.status}
${data.note ? `\nUpdate note: ${data.note}\n` : ""}
Sign in to your account to review the request details.

The Marketplace Team`,
  });
};
