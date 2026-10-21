import type { UserRole } from "../types/lifecycle";
import { sendEmail } from "./mailDelivery";

export const sendAdminRefundEscalationEmail = async (data: {
  to: string;
  customerName: string;
  businessName: string;
  refundRequestId: string;
  itemName: string;
  reasonNote: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Refund request escalated: ${data.refundRequestId}`,
    text: `A refund request has been escalated and needs administrator review.

Request: ${data.refundRequestId}
Customer: ${data.customerName}
Business: ${data.businessName}
Item: ${data.itemName}
Customer's reason: ${data.reasonNote}

Review the request in the administrator dashboard.`,
  });
};

export const sendUserRoleChangedEmail = async (data: {
  to: string;
  firstName: string;
  previousRole: UserRole;
  newRole: UserRole;
}) => {
  await sendEmail({
    to: data.to,
    subject: "Your account role has changed",
    text: `Hello ${data.firstName},

An administrator changed the role on your account.

Previous role: ${data.previousRole}
New role: ${data.newRole}

Sign in to see the features available to your account. If you did not expect this change, contact the marketplace support team.

The Marketplace Team`,
  });
};

export const sendUserAccountStatusChangedEmail = async (data: {
  to: string;
  firstName: string;
  isActive: boolean;
}) => {
  const status = data.isActive ? "reactivated" : "deactivated";
  await sendEmail({
    to: data.to,
    subject: `Your account has been ${status}`,
    text: `Hello ${data.firstName},

An administrator has ${status} your account. ${data.isActive
      ? "You can sign in and continue using your account."
      : "You will not be able to sign in while the account is inactive."}

If you believe this change was made in error, contact the marketplace support team.

The Marketplace Team`,
  });
};

export const sendAdminAccessPasswordChangedEmail = async (data: {
  to: string;
  adminName: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: "Administrator access password changed",
    text: `Hello ${data.adminName},

The shared administrator access password was changed.

If you made this change, no further action is needed. If you did not authorize it, contact the system owner immediately and review administrator account access.

For security, this email does not include the new password.

The Marketplace Security Team`,
  });
};
