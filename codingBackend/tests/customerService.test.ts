import { cancelOrder, createOrder, getProductsByCategory, getBusinessProducts, getBusinessById, requestRefund } from "../src/services/customerService";
import { Category, Order, OrderItem, product, ReturnRequest, sequelize, User, vendorBusiness } from "../src/models";
import { Op } from "sequelize";

jest.mock("../src/models", () => ({
  Order: { create: jest.fn(), findOne: jest.fn() },
  OrderItem: { create: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() },
  ReturnRequest: { create: jest.fn() },
  User: { findByPk: jest.fn() },
  product: { findByPk: jest.fn(), findAndCountAll: jest.fn() },
  Category: { findByPk: jest.fn() },
  vendorBusiness: { findAndCountAll: jest.fn(), findByPk: jest.fn() },
  sequelize: { transaction: jest.fn() },
}));

jest.mock("../src/email/vendorEmail", () => ({
  sendVendorNewOrderEmail: jest.fn(),
  sendVendorOrderCancellationEmail: jest.fn(),
  sendVendorRefundRequestEmail: jest.fn(),
}));

jest.mock("../src/email/customerEmail", () => ({
  sendCustomerOrderCancellationEmail: jest.fn(),
  sendCustomerOrderConfirmationEmail: jest.fn(),
  sendCustomerRefundRequestReceivedEmail: jest.fn(),
}));

jest.mock("../src/email/mailDelivery", () => ({
  sendEmailSafely: jest.fn((send: () => Promise<void>) => send()),
}));

jest.mock("../src/services/cacheService", () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined),
  invalidateCatalogCache: jest.fn().mockResolvedValue(undefined),
  invalidateVendorBusinessCache: jest.fn().mockResolvedValue(undefined),
}));

describe("customer order service", () => {
  const transaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    LOCK: { UPDATE: "UPDATE" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(sequelize.transaction).mockResolvedValue(transaction as never);
  });

  it("creates order items, decrements stock, and commits on success", async () => {
    const order = {
      id: "order-1",
      totalAmount: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const item = { id: "item-1" };
    const productRecord = {
      id: "product-1",
      businessId: "business-1",
      name: "Rice",
      price: 4,
      quantity: 8,
      decrement: jest.fn().mockResolvedValue(undefined),
    };

    jest.mocked(User.findByPk)
      .mockResolvedValueOnce({ address: "12 Main St", email: "customer@example.com", firstName: "Riley" } as never)
      .mockResolvedValue({ email: "vendor@example.com", firstName: "Morgan" } as never);
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({
      businessId: "business-1", userId: "vendor-1", businessName: "Market",
    } as never);
    jest.mocked(Order.create).mockResolvedValue(order as never);
    jest.mocked(product.findByPk).mockResolvedValue(productRecord as never);
    jest.mocked(OrderItem.create).mockResolvedValue(item as never);

    await expect(createOrder("customer-1", [{ productId: "product-1", qty: 2 }])).resolves.toBe(order);

    expect(Order.create).toHaveBeenCalledWith(
      { customerId: "customer-1", totalAmount: 0, shippingAddress: "12 Main St" },
      { transaction },
    );
    expect(OrderItem.create).toHaveBeenCalledWith(
      {
        orderId: "order-1",
        productId: "product-1",
        businessId: "business-1",
        name: "Rice",
        quantity: 2,
        unitPrice: 4,
      },
      { transaction },
    );
    expect(productRecord.decrement).toHaveBeenCalledWith("quantity", { by: 2, transaction });
    expect(order.totalAmount).toBe(8);
    expect(order.save).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
    expect(jest.requireMock("../src/services/cacheService").invalidateCatalogCache).toHaveBeenCalledTimes(1);
    expect(jest.requireMock("../src/services/cacheService").invalidateVendorBusinessCache)
      .toHaveBeenCalledWith("business-1");
    expect(jest.requireMock("../src/email/customerEmail").sendCustomerOrderConfirmationEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "customer@example.com",
        firstName: "Riley",
        orderId: "order-1",
        totalAmount: 8,
        shippingAddress: "12 Main St",
      }));
    expect(jest.requireMock("../src/email/vendorEmail").sendVendorNewOrderEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "vendor@example.com",
        businessName: "Market",
        items: [{ name: "Rice", quantity: 2, unitPrice: 4 }],
        totalAmount: 8,
      }));
  });

  it("rolls back when an order references a missing product", async () => {
    jest.mocked(User.findByPk).mockResolvedValue({ address: "12 Main St" } as never);
    jest.mocked(Order.create).mockResolvedValue({ id: "order-1" } as never);
    jest.mocked(product.findByPk).mockResolvedValue(null);

    await expect(
      createOrder("customer-1", [{ productId: "missing-product", qty: 1 }]),
    ).rejects.toThrow("product not found");

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it("rejects unavailable stock and rolls back without creating order items", async () => {
    jest.mocked(User.findByPk).mockResolvedValue({ address: "12 Main St" } as never);
    jest.mocked(Order.create).mockResolvedValue({ id: "order-1" } as never);
    jest.mocked(product.findByPk).mockResolvedValue({ quantity: 1 } as never);

    await expect(
      createOrder("customer-1", [{ productId: "product-1", qty: 2 }]),
    ).rejects.toThrow("product out of stock");

    expect(OrderItem.create).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });

  it("creates a refund request for the owning customer and marks the order item requested", async () => {
    const orderItem = {
      id: "item-1",
      orderId: "order-1",
      businessId: "business-1",
      name: "Rice",
      refundStatus: "none",
      update: jest.fn().mockResolvedValue(undefined),
    };
    const refundRequest = { id: "refund-1", reasonNote: "Item arrived damaged" };
    jest.mocked(OrderItem.findByPk).mockResolvedValue(orderItem as never);
    jest.mocked(Order.findOne).mockResolvedValue({ id: "order-1" } as never);
    jest.mocked(ReturnRequest.create).mockResolvedValue(refundRequest as never);
    jest.mocked(User.findByPk)
      .mockResolvedValueOnce({ email: "customer@example.com", firstName: "Riley" } as never)
      .mockResolvedValue({ email: "vendor@example.com", firstName: "Morgan" } as never);
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({
      businessId: "business-1", userId: "vendor-1", businessName: "Market",
    } as never);

    await expect(requestRefund("customer-1", "item-1", "Item arrived damaged")).resolves.toEqual({
      refundRequest,
      orderItem,
    });

    expect(Order.findOne).toHaveBeenCalledWith({
      where: { id: "order-1", customerId: "customer-1" },
      transaction,
    });
    expect(ReturnRequest.create).toHaveBeenCalledWith({
      orderItemId: "item-1",
      customerId: "customer-1",
      businessId: "business-1",
      reasonNote: "Item arrived damaged",
    }, { transaction });
    expect(orderItem.update).toHaveBeenCalledWith({ refundStatus: "requested" }, { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(jest.requireMock("../src/email/customerEmail").sendCustomerRefundRequestReceivedEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "customer@example.com", refundRequestId: "refund-1", itemName: "Rice",
      }));
    expect(jest.requireMock("../src/email/vendorEmail").sendVendorRefundRequestEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "vendor@example.com", businessName: "Market", refundRequestId: "refund-1",
      }));
  });

  it("notifies the customer and vendors when the customer cancels an order", async () => {
    const order = {
      id: "order-1", orderStatus: "pending", isCancelled: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.mocked(Order.findOne).mockResolvedValue(order as never);
    jest.mocked(User.findByPk)
      .mockResolvedValueOnce({ email: "customer@example.com", firstName: "Riley" } as never)
      .mockResolvedValue({ email: "vendor@example.com", firstName: "Morgan" } as never);
    jest.mocked(OrderItem.findAll).mockResolvedValue([{ businessId: "business-1", name: "Rice" }] as never);
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({
      businessId: "business-1", userId: "vendor-1", businessName: "Market",
    } as never);

    await expect(cancelOrder("order-1", "customer-1", "Changed my mind")).resolves.toBe(order);

    expect(jest.requireMock("../src/email/customerEmail").sendCustomerOrderCancellationEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "customer@example.com", orderId: "order-1", reason: "Changed my mind",
      }));
    expect(jest.requireMock("../src/email/vendorEmail").sendVendorOrderCancellationEmail)
      .toHaveBeenCalledWith(expect.objectContaining({
        to: "vendor@example.com", orderId: "order-1", items: ["Rice"],
      }));
  });

  it("does not create a refund request for another customer's order item", async () => {
    jest.mocked(OrderItem.findByPk).mockResolvedValue({ id: "item-1", orderId: "order-1" } as never);
    jest.mocked(Order.findOne).mockResolvedValue(null);

    await expect(requestRefund("customer-1", "item-1", "Refund reason")).rejects.toThrow("Order item not found");

    expect(ReturnRequest.create).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
});

describe("customer product category queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads only public businesses and active products for the catalog", async () => {
    const business = { businessId: "business-1", status: "verified", isVerified: true, product: [{ id: "product-1", status: "active" }] };
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue(business as never);

    await expect(getBusinessById("business-1")).resolves.toBe(business);

    expect(vendorBusiness.findByPk).toHaveBeenCalledWith("business-1", expect.objectContaining({
      include: [expect.objectContaining({ model: product, as: "product", where: { status: "active" } })],
    }));
  });

  it("returns stored category names and the business profile when listing products", async () => {
    jest.mocked(vendorBusiness.findByPk).mockResolvedValue({ businessId: "business-1", status: "verified", isVerified: true } as never);
    jest.mocked(product.findAndCountAll).mockResolvedValue({ rows: [], count: 0 } as never);

    await getBusinessProducts("business-1", "1", "10");

    const options = jest.mocked(product.findAndCountAll).mock.calls[0][0];
    expect(options.where).toEqual(expect.objectContaining({ businessId: "business-1", status: "active" }));
    expect(options.include).toEqual(expect.arrayContaining([
      expect.objectContaining({ model: vendorBusiness, as: "vendorBusiness", where: { status: "verified", isVerified: true } }),
    ]));
    expect(options.attributes).toContain("categoryNames");
  });

  it("filters products by stored category name and public visibility rules", async () => {
    jest.mocked(Category.findByPk).mockResolvedValue({ id: "category-1", category: "Electronics" } as never);
    jest.mocked(product.findAndCountAll).mockResolvedValue({ rows: [], count: 0 } as never);

    await expect(getProductsByCategory("category-1", "2", "5")).resolves.toEqual({
      items: [],
      pagination: { page: 2, limit: 5, totalItems: 0, totalPages: 0 },
    });

    const options = jest.mocked(product.findAndCountAll).mock.calls[0][0];
    expect(options.where).toEqual(expect.objectContaining({
      status: "active",
      categoryNames: { [Op.contains]: ["Electronics"] },
    }));
    expect(options.include).toContainEqual(expect.objectContaining({
      model: vendorBusiness,
      as: "vendorBusiness",
      where: { status: "verified", isVerified: true },
    }));
    expect(options.offset).toBe(5);
  });

  it("returns not found for an unknown product category", async () => {
    jest.mocked(Category.findByPk).mockResolvedValue(null);

    await expect(getProductsByCategory("missing-category", "1", "10")).rejects.toThrow("Product category not found");
    expect(product.findAndCountAll).not.toHaveBeenCalled();
  });
});