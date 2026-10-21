import { addProduct, createBusiness, updateProduct, getBusinessProducts, updateOrderStatus, getRefundRequests, updateRefundStatus } from "../src/services/vendorService";
import {
  getApiLogs,
  updateAdminOrderStatus,
  updatePassword,
  updateProductStatus,
  updateRefundStatusAdmin,
  updateUserRole,
  updateUserStatus,
  verifyBusiness,
} from "../src/services/adminService";
import { appSetting, Category, Order, OrderItem, product, ReturnRequest, sequelize, User, vendorBusiness } from "../src/models";
import { apiLogs } from "../src/models/triggeredApi";
import { hashPassword } from "../src/helper/passwordHelper";
import { uploadImageToCloudinary } from "../src/helper/fileUpolad";

jest.mock("../src/models", () => ({
  User: { findByPk: jest.fn(), findAll: jest.fn(), findOne: jest.fn() },
  vendorBusiness: { findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  product: { findAndCountAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  Category: { findAll: jest.fn() },
  Order: { findByPk: jest.fn() },
  OrderItem: { findAndCountAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() },
  ReturnRequest: { findAndCountAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
  sequelize: { transaction: jest.fn() },
  appSetting: { upsert: jest.fn() },
}));

jest.mock("../src/email/mailDelivery", () => ({
  sendEmailSafely: jest.fn((send: () => Promise<void>) => send()),
}));

jest.mock("../src/email/customerEmail", () => ({
  sendCustomerOrderCancellationEmail: jest.fn(),
  sendCustomerOrderStatusEmail: jest.fn(),
  sendCustomerRefundStatusEmail: jest.fn(),
}));

jest.mock("../src/email/adminEmail", () => ({
  sendAdminRefundEscalationEmail: jest.fn(),
  sendAdminAccessPasswordChangedEmail: jest.fn(),
  sendUserRoleChangedEmail: jest.fn(),
  sendUserAccountStatusChangedEmail: jest.fn(),
}));

jest.mock("../src/email/businessEmail", () => ({
  sendBusinessApplicationReceivedEmail: jest.fn(),
  sendAdminBusinessApplicationEmail: jest.fn(),
  sendBusinessApplicationDecisionEmail: jest.fn(),
}));

jest.mock("../src/email/vendorEmail", () => ({
  sendVendorOrderCancellationEmail: jest.fn(),
  sendVendorProductStatusEmail: jest.fn(),
}));

jest.mock("../src/models/triggeredApi", () => ({
  apiLogs: { findAndCountAll: jest.fn() },
}));

jest.mock("../src/helper/fileUpolad", () => ({
  uploadImageToCloudinary: jest.fn(),
  fileUploader: { single: jest.fn() },
}));

jest.mock("../src/helper/passwordHelper", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock("../src/utils/logger", () => ({ logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } }));

describe("vendor and admin services", () => {
  const transaction = { commit: jest.fn(), rollback: jest.fn(), LOCK: { UPDATE: "UPDATE" } };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(sequelize.transaction).mockResolvedValue(transaction as never);
    jest.mocked(User.findAll).mockResolvedValue([] as never);
  });

  it("emails the business owner and active administrators after business registration", async () => {
    const business = {
      businessId: "business-1",
      businessName: "Market",
      description: "Local goods",
      toJSON: () => ({ businessId: "business-1" }),
    };
    const user = {
      id: "vendor-1",
      email: "vendor@example.com",
      firstName: "Morgan",
      lastName: "Lee",
      update: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(User.findOne).mockResolvedValue(user as never);
    jest.mocked(vendorBusiness.findOne).mockResolvedValue(null);
    jest.mocked(vendorBusiness.create).mockResolvedValue(business as never);
    jest.mocked(User.findAll).mockResolvedValue([{ email: "admin@example.com" }] as never);

    await expect(createBusiness({ businessName: "Market", description: "Local goods" }, user.email))
      .resolves.toEqual({ businessId: "business-1" });

    expect(jest.requireMock("../src/email/businessEmail").sendBusinessApplicationReceivedEmail)
      .toHaveBeenCalledWith({ to: "vendor@example.com", firstName: "Morgan", businessName: "Market" });
    expect(jest.requireMock("../src/email/businessEmail").sendAdminBusinessApplicationEmail)
      .toHaveBeenCalledWith(expect.objectContaining({ to: "admin@example.com", businessName: "Market" }));
  });

  it("emails users when an administrator changes role or active status", async () => {
    const admin = { role: "admin" };
    const user = {
      id: "user-1", role: "user", isActive: true, email: "user@example.com", firstName: "Riley",
      save: jest.fn().mockResolvedValue(undefined), toSafeJSON: () => ({ id: "user-1" }),
    };
    jest.mocked(User.findByPk).mockResolvedValueOnce(admin as never).mockResolvedValueOnce(user as never);

    await updateUserRole("admin-1", "user-1", "vendor");

    expect(jest.requireMock("../src/email/adminEmail").sendUserRoleChangedEmail)
      .toHaveBeenCalledWith({
        to: "user@example.com", firstName: "Riley", previousRole: "user", newRole: "vendor",
      });

    jest.mocked(User.findByPk).mockResolvedValueOnce(admin as never).mockResolvedValueOnce(user as never);
    await updateUserStatus("admin-1", "user-1", false);

    expect(jest.requireMock("../src/email/adminEmail").sendUserAccountStatusChangedEmail)
      .toHaveBeenCalledWith({ to: "user@example.com", firstName: "Riley", isActive: false });
  });

  it("emails a business owner when an administrator verifies the business", async () => {
    const business = {
      businessId: "business-1", userId: "vendor-1", businessName: "Market", status: "pending",
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue(business as never);
    jest.mocked(User.findByPk).mockResolvedValue({ email: "vendor@example.com", firstName: "Morgan" } as never);

    await verifyBusiness("business-1", true);

    expect(jest.requireMock("../src/email/businessEmail").sendBusinessApplicationDecisionEmail)
      .toHaveBeenCalledWith({
        to: "vendor@example.com", firstName: "Morgan", businessName: "Market", status: "verified",
      });
  });

  it("emails the vendor when an administrator changes product moderation status", async () => {
    const item = {
      id: "product-1", businessId: "business-1", name: "Rice", status: "active",
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(product.findByPk).mockResolvedValue(item as never);
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({
      businessId: "business-1", userId: "vendor-1", businessName: "Market",
    } as never);
    jest.mocked(User.findByPk).mockResolvedValue({ email: "vendor@example.com", firstName: "Morgan" } as never);

    await updateProductStatus("product-1", "hidden");

    expect(jest.requireMock("../src/email/vendorEmail").sendVendorProductStatusEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "vendor@example.com", businessName: "Market", productName: "Rice", status: "hidden",
      }));
  });

  it("routes admin order cancellation emails to the customer and affected vendor", async () => {
    const order = {
      id: "order-1", customerId: "customer-1", orderStatus: "pending", isCancelled: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(Order.findByPk).mockResolvedValue(order as never);
    jest.mocked(User.findByPk)
      .mockResolvedValueOnce({ email: "customer@example.com", firstName: "Riley" } as never)
      .mockResolvedValue({ email: "vendor@example.com", firstName: "Morgan" } as never);
    jest.mocked(OrderItem.findAll).mockResolvedValue([{ businessId: "business-1", name: "Rice" }] as never);
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({
      businessId: "business-1", userId: "vendor-1", businessName: "Market",
    } as never);

    await updateAdminOrderStatus("order-1", "cancelled");

    expect(jest.requireMock("../src/email/customerEmail").sendCustomerOrderCancellationEmail)
      .toHaveBeenCalledWith(expect.objectContaining({ to: "customer@example.com", orderId: "order-1" }));
    expect(jest.requireMock("../src/email/vendorEmail").sendVendorOrderCancellationEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "vendor@example.com", orderId: "order-1", items: ["Rice"],
      }));
  });

  it("emails the customer when an administrator updates a refund status", async () => {
    const refundRequest = {
      id: "refund-1", orderItemId: "item-1", customerId: "customer-1", reasonNote: "Damaged",
    };
    const orderItem = {
      id: "item-1", name: "Rice", refundStatus: "processing", save: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(ReturnRequest.findByPk).mockResolvedValue(refundRequest as never);
    jest.mocked(OrderItem.findByPk).mockResolvedValue(orderItem as never);
    jest.mocked(User.findByPk).mockResolvedValue({ email: "customer@example.com", firstName: "Riley" } as never);

    await updateRefundStatusAdmin("refund-1", "refunded");

    expect(jest.requireMock("../src/email/customerEmail").sendCustomerRefundStatusEmail)
      .toHaveBeenCalledWith({
        to: "customer@example.com", firstName: "Riley", refundRequestId: "refund-1", itemName: "Rice", status: "refunded",
      });
  });

  it("limits product updates to the requested business", async () => {
    const record = { update: jest.fn().mockResolvedValue(undefined) };
    jest.mocked(product.findOne).mockResolvedValue(record as never);
    const update = { price: 12 };

    await expect(updateProduct("business-1", "product-1", update)).resolves.toBe(record);

    expect(product.findOne).toHaveBeenCalledWith({
      where: { id: "product-1", businessId: "business-1" },
    });
    expect(record.update).toHaveBeenCalledWith(update);
  });

  it("replaces product categories when category IDs are provided", async () => {
    const category = { id: "category-1", category: "Electronics" };
    const record = { update: jest.fn().mockResolvedValue(undefined), setCategories: jest.fn().mockResolvedValue(undefined) };
    jest.mocked(product.findOne).mockResolvedValue(record as never);
    jest.mocked(Category.findAll).mockResolvedValue([category] as never);

    await expect(updateProduct("business-1", "product-1", { categoryIds: ["category-1", "category-1"] })).resolves.toBe(record);

    expect(Category.findAll).toHaveBeenCalledWith({ where: { id: ["category-1"] } });
    expect(record.setCategories).toHaveBeenCalledWith([category]);
    expect(record.update).toHaveBeenCalledWith({ categoryNames: ["Electronics"] });
  });

  it("attaches requested categories to a newly created product", async () => {
    const category = { id: "category-1", category: "Electronics" };
    const setCategories = jest.fn().mockResolvedValue(undefined);
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({ businessId: "business-1" } as never);
    jest.mocked(Category.findAll).mockResolvedValue([category] as never);
    jest.mocked(uploadImageToCloudinary).mockResolvedValue({ publicId: "image-1", secureUrl: "https://example.test/image" } as never);
    jest.mocked(product.create).mockResolvedValue({ setCategories } as never);

    await addProduct("business-1", {
      name: "Product",
      description: "Description",
      price: 10,
      quantity: 1,
      categoryIds: ["category-1", "category-1"],
      file: {} as Express.Multer.File,
    });

    expect(Category.findAll).toHaveBeenCalledWith({ where: { id: ["category-1"] } });
    expect(product.create).toHaveBeenCalledWith(expect.objectContaining({ categoryNames: ["Electronics"] }));
    expect(setCategories).toHaveBeenCalledWith([category]);
  });

  it("paginates vendor products and returns pagination metadata", async () => {
    const rows = [{ id: "product-1" }];
    jest.mocked(product.findAndCountAll).mockResolvedValue({ rows, count: 9 } as never);

    await expect(getBusinessProducts("business-1", "2", "3")).resolves.toEqual({
      items: rows,
      pagination: { page: 2, limit: 3, totalItems: 9, totalPages: 3 },
    });

    expect(product.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { businessId: "business-1" },
      include: expect.arrayContaining([
        expect.objectContaining({ model: vendorBusiness, as: "vendorBusiness" }),
      ]),
      limit: 3,
      offset: 3,
    }));
  });

  it("updates and returns an order item status within the requested business", async () => {
    const orderItem = {
      id: "item-1",
      orderId: "order-1",
      itemStatus: "pending",
      name: "Rice",
      update: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(OrderItem.findOne).mockResolvedValue(orderItem as never);
    jest.mocked(Order.findByPk).mockResolvedValue({ id: "order-1", customerId: "customer-1" } as never);
    jest.mocked(User.findByPk).mockResolvedValue({ email: "customer@example.com", firstName: "Riley" } as never);

    await expect(updateOrderStatus("item-1", "business-1", "shipped")).resolves.toBe(orderItem);

    expect(OrderItem.findOne).toHaveBeenCalledWith({ where: { id: "item-1", businessId: "business-1" } });
    expect(orderItem.update).toHaveBeenCalledWith({ itemStatus: "shipped" });
    expect(jest.requireMock("../src/email/customerEmail").sendCustomerOrderStatusEmail)
      .toHaveBeenCalledWith({
        to: "customer@example.com",
        firstName: "Riley",
        orderId: "order-1",
        itemName: "Rice",
        status: "shipped",
      });
  });

  it("lists refund requests only for a business owned by the vendor", async () => {
    const requests = [{ id: "refund-1" }];
    jest.mocked(vendorBusiness.findOne).mockResolvedValue({ businessId: "business-1" } as never);
    jest.mocked(ReturnRequest.findAndCountAll).mockResolvedValue({ rows: requests, count: 1 } as never);

    await expect(getRefundRequests("vendor-1", "business-1", "requested", "1", "10")).resolves.toEqual({
      items: requests,
      pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    });

    expect(ReturnRequest.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { businessId: "business-1" },
      include: expect.arrayContaining([
        expect.objectContaining({ as: "orderItem", where: { refundStatus: "requested" } }),
        expect.objectContaining({ as: "customer" }),
      ]),
    }));
  });

  it("advances an owned refund request and its order item atomically", async () => {
    const refundRequest = {
      id: "refund-1", orderItemId: "item-1", customerId: "customer-1", reasonNote: "Damaged",
    };
    const orderItem = {
      id: "item-1", name: "Rice", refundStatus: "requested", update: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(vendorBusiness.findOne).mockResolvedValue({ businessId: "business-1" } as never);
    jest.mocked(ReturnRequest.findOne).mockResolvedValue(refundRequest as never);
    jest.mocked(OrderItem.findByPk).mockResolvedValue(orderItem as never);
    jest.mocked(User.findByPk).mockResolvedValue({ email: "customer@example.com", firstName: "Riley" } as never);

    await expect(updateRefundStatus("vendor-1", "business-1", "refund-1", "processing")).resolves.toEqual({
      refundRequest,
      orderItem,
    });

    expect(orderItem.update).toHaveBeenCalledWith({ refundStatus: "processing" }, { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(jest.requireMock("../src/email/customerEmail").sendCustomerRefundStatusEmail)
      .toHaveBeenCalledWith({
        to: "customer@example.com",
        firstName: "Riley",
        refundRequestId: "refund-1",
        itemName: "Rice",
        status: "processing",
      });
  });

  it("rejects refund transitions that skip processing", async () => {
    jest.mocked(vendorBusiness.findOne).mockResolvedValue({ businessId: "business-1" } as never);
    jest.mocked(ReturnRequest.findOne).mockResolvedValue({ id: "refund-1", orderItemId: "item-1" } as never);
    const orderItem = { id: "item-1", refundStatus: "requested", update: jest.fn() };
    jest.mocked(OrderItem.findByPk).mockResolvedValue(orderItem as never);

    await expect(updateRefundStatus("vendor-1", "business-1", "refund-1", "refunded")).rejects.toThrow("Cannot change refund status");

    expect(orderItem.update).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });

  it("maps API logs to the response shape with ISO timestamps", async () => {
    const createdAt = new Date("2026-09-01T12:30:00.000Z");
    jest.mocked(apiLogs.findAndCountAll).mockResolvedValue({
      rows: [{ id: "log-1", userId: "user-1", method: "POST", statusCode: 201, ipAddress: "127.0.0.1", createdAt }],
      count: 1,
    } as never);

    await expect(getApiLogs("1", "10")).resolves.toEqual({
      items: [{
        id: "log-1",
        userId: "user-1",
        method: "POST",
        statusCode: 201,
        ipAddress: "127.0.0.1",
        time: createdAt.toISOString(),
      }],
      pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    });
  });

  it("hashes and persists the configured admin password", async () => {
    jest.mocked(hashPassword).mockResolvedValue("secure-hash");
    jest.mocked(appSetting.upsert).mockResolvedValue([{} as never, true] as never);

    await expect(updatePassword("StrongPass1!")).resolves.toEqual({ message: "Password set successfully" });

    expect(hashPassword).toHaveBeenCalledWith("StrongPass1!");
    expect(appSetting.upsert).toHaveBeenCalledWith({ key: "admin_password", value: "secure-hash" });
  });
});