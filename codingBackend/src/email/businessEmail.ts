import type { BusinessStatus } from "../types/lifecycle";
import { sendEmail } from "./mailDelivery";

export const sendBusinessApplicationReceivedEmail = async (data: {
  to: string;
  firstName: string;
  businessName: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `We received your ${data.businessName} business application`,
    text: `Hello ${data.firstName},

Your application for ${data.businessName} has been received and is awaiting review. We will email you when its status changes.

You can sign in to your account to review your business profile.

The Marketplace Team`,
  });
};

export const sendAdminBusinessApplicationEmail = async (data: {
  to: string;
  applicantName: string;
  applicantEmail: string;
  businessName: string;
  description: string;
}) => {
  await sendEmail({
    to: data.to,
    subject: `Business application awaiting review: ${data.businessName}`,
    text: `A new business application is awaiting review.

Business: ${data.businessName}
Applicant: ${data.applicantName}
Applicant email: ${data.applicantEmail}
Description: ${data.description}

Review the application in the administrator dashboard.`,
  });
};

export const sendBusinessApplicationDecisionEmail = async (data: {
  to: string;
  firstName: string;
  businessName: string;
  status: BusinessStatus;
  note?: string;
}) => {
  const statusText: Record<BusinessStatus, string> = {
    pending: "is awaiting review",
    verified: "has been approved and verified",
    rejected: "was not approved",
    suspended: "has been suspended",
  };

  await sendEmail({
    to: data.to,
    subject: `Update on your ${data.businessName} business application`,
    text: `Hello ${data.firstName},

Your business ${data.businessName} ${statusText[data.status]}.
${data.note ? `\nReview note: ${data.note}\n` : ""}
You can sign in to view your business profile and current status. If you believe this decision needs clarification, contact the marketplace support team.

The Marketplace Team`,
  });
};
