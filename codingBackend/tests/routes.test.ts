import express from "express";
import request from "supertest";
import * as customerService from "../src/services/customerService";
import * as vendorService from "../src/services/vendorService";
import * as logService from "../src/services/adminService";
import customerRoutes from "../src/routes/customerRoute";
import vendorRoutes from "../src/routes/vendorRoute";
import adminRoutes from "../src/routes/admin.routes";
import { errorHandler } from "../src/middleware/errorHandler.middleware";

jest.mock("../src/middleware/auth.middleware", () => ({
  authenticate: (req: unknown, _res: unknown, next: () => void) => {
    (req as { user?: { sub: string } }).user = { sub: "11111111-1111-4111-8111-111111111111" };
    next();
  },
  authorize: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("../src/middleware/idempotency", () => ({
  idempotencyMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("../src/middleware/requirePassword", () => ({
  requirePassword: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("../src/helper/fileUpolad", () => ({
  fileUploader: { single: () => (_req: unknown, _res: unknown, next: () => void) => next() },
}));

jest.mock("../src/services/customerService", () => ({
  getBusinesses: jest.fn(),
  getBusinessById: jest.fn(),
  getBusinessProducts: jest.fn(),
  getProductsByCategory: jest.fn(),
  searchProducts: jest.fn(),
  getBusinessProductById: jest.fn(),
  createOrder: jest.fn(),
  addOrderItem: jest.fn(),
  requestRefund: jest.fn(),
  cancelOrder: jest.fn(),
}));

jest.mock("../src/services/vendorService", () => ({
  createBusiness: jest.fn(),
  getBusinessProfile: jest.fn(),
  updateBusiness: jest.fn(),
  addProduct: jest.fn(),
  getBusinessProducts: jest.fn(),
  updateProduct: jest.fn(),
  updateOrderStatus: jest.fn(),
  getRefundRequests: jest.fn(),
  updateRefundStatus: jest.fn(),
  deleteProduct: jest.fn(),
  getOrderByStatus: jest.fn(),
}));

jest.mock("../src/services/adminService", () => ({
  getApiLogs: jest.fn(),
  updatePassword: jest.fn(),
  getUsers: jest.fn(),
  getBusinesses: jest.fn(),
  getProducts: jest.fn(),
  getOrders: jest.fn(),
  getDashboardSummary: jest.fn(),
  updateAdminOrderStatus: jest.fn(),
  updateRefundStatusAdmin: jest.fn(),
  updateUserRole: jest.fn(),
  updateUserStatus: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/customer", customerRoutes);
app.use("/api/business", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);

const pagination = { page: 2, limit: 2, totalItems: 5, totalPages: 3 };
const businessId = "a8187771-9af6-460c-9634-f73ac9992803";
const adminUserId = "11111111-1111-4111-8111-111111111111";
const targetUserId = "22222222-2222-4222-8222-222222222222";

describe("paginated list routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated customer businesses", async () => {
    const businesses = [{ businessId, businessName: "Market" }];
    jest.mocked(customerService.getBusinesses).mockResolvedValue({
      items: businesses as never,
      pagination,
    });

    const response = await request(app)
      .get("/api/customer/get-businesses?page=2&limit=2")
      .expect(202);

    expect(customerService.getBusinesses).toHaveBeenCalledWith("2", "2");
    expect(response.body.data).toEqual(businesses);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("passes the acting admin id when updating a user role", async () => {
    const user = { id: targetUserId, role: "vendor" };
    jest.mocked(logService.updateUserRole).mockResolvedValue(user as never);

    const response = await request(app)
      .patch(`/api/admin/users/${targetUserId}/role`)
      .send({ role: "vendor" })
      .expect(200);

    expect(logService.updateUserRole).toHaveBeenCalledWith(adminUserId, targetUserId, "vendor");
    expect(response.body.data).toEqual(user);
  });

  it("passes the acting admin id when updating a user status", async () => {
    const user = { id: targetUserId, isActive: false };
    jest.mocked(logService.updateUserStatus).mockResolvedValue(user as never);

    const response = await request(app)
      .patch(`/api/admin/users/${targetUserId}/status`)
      .send({ isActive: false })
      .expect(200);

    expect(logService.updateUserStatus).toHaveBeenCalledWith(adminUserId, targetUserId, false);
    expect(response.body.data).toEqual(user);
  });

  it("returns paginated products for a customer business", async () => {
    const products = [{ name: "Rice" }];
    jest.mocked(customerService.getBusinessProducts).mockResolvedValue({
      items: products as never,
      pagination,
    });

    const response = await request(app)
      .get(`/api/customer/${businessId}/products?page=2&limit=2`)
      .expect(202);

    expect(customerService.getBusinessProducts).toHaveBeenCalledWith(businessId, "2", "2");
    expect(response.body.data).toEqual(products);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("returns paginated products for a category", async () => {
    const categoryId = "9b17d398-d078-4bb9-8122-400e73420465";
    const products = [{ name: "Rice", categories: [{ id: categoryId }] }];
    jest.mocked(customerService.getProductsByCategory).mockResolvedValue({
      items: products as never,
      pagination,
    });

    const response = await request(app)
      .get(`/api/customer/category/${categoryId}/products?page=2&limit=2`)
      .expect(200);

    expect(customerService.getProductsByCategory).toHaveBeenCalledWith(categoryId, "2", "2");
    expect(response.body.data).toEqual(products);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("searches products and passes the trimmed query", async () => {
    const products = [{ name: "Rice" }];
    jest.mocked(customerService.searchProducts).mockResolvedValue({
      items: products as never,
      pagination,
    });

    const response = await request(app)
      .get("/api/customer/search-products?q=%20rice%20&page=2&limit=2")
      .expect(200);

    expect(customerService.searchProducts).toHaveBeenCalledWith("rice", "2", "2");
    expect(response.body.data).toEqual(products);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("rejects an empty product search", async () => {
    await request(app).get("/api/customer/search-products?q=%20%20").expect(400);
    expect(customerService.searchProducts).not.toHaveBeenCalled();
  });

  it("authorizes a vendor business update using the authenticated user id", async () => {
    const updatedBusiness = { businessId, businessName: "Updated Market" };
    jest.mocked(vendorService.updateBusiness).mockResolvedValue(updatedBusiness as never);

    const response = await request(app)
      .patch(`/api/business/${businessId}`)
      .send({ businessName: "Updated Market" })
      .expect(200);

    expect(vendorService.updateBusiness).toHaveBeenCalledWith(adminUserId, businessId, { businessName: "Updated Market" });
    expect(response.body.data).toEqual(updatedBusiness);
  });

  it("returns paginated vendor products", async () => {
    const products = [{ name: "Rice" }];
    jest.mocked(vendorService.getBusinessProducts).mockResolvedValue({
      items: products as never,
      pagination,
    });

    const response = await request(app)
      .get(`/api/business/${businessId}/products?page=2&limit=2`)
      .expect(200);

    expect(vendorService.getBusinessProducts).toHaveBeenCalledWith(businessId, "2", "2");
    expect(response.body.data).toEqual(products);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("returns paginated vendor orders and applies status filtering", async () => {
    const orders = [{ name: "Rice", itemStatus: "shipped" }];
    jest.mocked(vendorService.getOrderByStatus).mockResolvedValue({
      items: orders as never,
      pagination,
    });

    const response = await request(app)
      .get(`/api/business/${businessId}/orders?status=shipped&page=2&limit=2`)
      .expect(200);

    expect(vendorService.getOrderByStatus).toHaveBeenCalledWith(businessId, "shipped", "2", "2");
    expect(response.body.data).toEqual(orders);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("updates a vendor order item's status", async () => {
    const itemId = "7505f2f8-a16b-4d85-935b-2c9ff6301056";
    const orderItem = { id: itemId, itemStatus: "shipped" };
    jest.mocked(vendorService.updateOrderStatus).mockResolvedValue(orderItem as never);

    const response = await request(app)
      .patch(`/api/business/${businessId}/orders/${itemId}/status`)
      .send({ status: "shipped" })
      .expect(200);

    expect(vendorService.updateOrderStatus).toHaveBeenCalledWith(itemId, businessId, "shipped");
    expect(response.body.data).toEqual(orderItem);
  });

  it("rejects invalid order item statuses", async () => {
    const itemId = "7505f2f8-a16b-4d85-935b-2c9ff6301056";

    await request(app)
      .patch(`/api/business/${businessId}/orders/${itemId}/status`)
      .send({ status: "cancelled" })
      .expect(400);

    expect(vendorService.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("allows a customer to request a refund with a reason", async () => {
    const orderItemId = "a152f846-f17c-4857-b3df-13e35c06eaa4";
    const result = { refundRequest: { id: "refund-1" }, orderItem: { refundStatus: "requested" } };
    jest.mocked(customerService.requestRefund).mockResolvedValue(result as never);

    const response = await request(app)
      .post(`/api/customer/order-items/${orderItemId}/refund-requests`)
      .send({ reasonNote: "Item arrived damaged" })
      .expect(201);

    expect(customerService.requestRefund).toHaveBeenCalledWith(adminUserId, orderItemId, "Item arrived damaged");
    expect(response.body.data).toEqual(result);
  });

  it("lists business refund requests with pagination and status filtering", async () => {
    const requests = [{ id: "refund-1", reasonNote: "Damaged" }];
    jest.mocked(vendorService.getRefundRequests).mockResolvedValue({ items: requests, pagination } as never);

    const response = await request(app)
      .get(`/api/business/${businessId}/refund-requests?status=requested&page=2&limit=2`)
      .expect(200);

    expect(vendorService.getRefundRequests).toHaveBeenCalledWith(adminUserId, businessId, "requested", "2", "2");
    expect(response.body.data).toEqual(requests);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("allows a vendor to update a refund request status", async () => {
    const refundRequestId = "d19622a2-184a-4fe1-aefb-f53ba6e3c139";
    const result = { refundRequest: { id: refundRequestId }, orderItem: { refundStatus: "processing" } };
    jest.mocked(vendorService.updateRefundStatus).mockResolvedValue(result as never);

    const response = await request(app)
      .patch(`/api/business/${businessId}/refund-requests/${refundRequestId}/status`)
      .send({ status: "processing" })
      .expect(200);

    expect(vendorService.updateRefundStatus).toHaveBeenCalledWith(adminUserId, businessId, refundRequestId, "processing");
    expect(response.body.data).toEqual(result);
  });

  it("returns paginated API logs", async () => {
    const logs = [{ id: "log-1", method: "GET" }];
    jest.mocked(logService.getApiLogs).mockResolvedValue({
      items: logs as never,
      pagination,
    });

    const response = await request(app)
      .post("/api/admin/logs?page=2&limit=2")
      .expect(200);

    expect(logService.getApiLogs).toHaveBeenCalledWith("2", "2");
    expect(response.body.data.logs).toEqual(logs);
    expect(response.body.pagination).toEqual(pagination);
  });

  it("returns admin dashboard summary", async () => {
    const summary = { totalUsers: 10, totalBusinesses: 3, totalProducts: 25, totalOrders: 40, pendingRefunds: 2, totalRevenue: 1500 };
    jest.mocked(logService.getDashboardSummary).mockResolvedValue(summary as never);

    const response = await request(app)
      .get("/api/admin/dashboard/summary")
      .expect(200);

    expect(logService.getDashboardSummary).toHaveBeenCalledWith();
    expect(response.body.data).toEqual(summary);
  });

  it("rejects invalid admin order status payloads", async () => {
    await request(app)
      .patch("/api/admin/orders/93f754b2-9db2-4c1a-9d4a-f54d49f9d3d1/status")
      .send({ status: "not-a-real-status" })
      .expect(400);

    expect(logService.getOrders).not.toHaveBeenCalled();
  });

  it("allows a customer to cancel an order", async () => {
    const orderId = "d6b5f7a5-4330-403d-9d00-8271d6f2f1a0";
    const cancelledOrder = { id: orderId, isCancelled: true, orderStatus: "cancelled" };
    jest.mocked(customerService.cancelOrder).mockResolvedValue(cancelledOrder as never);

    const response = await request(app)
      .patch(`/api/customer/orders/${orderId}/cancel`)
      .send({ reason: "Changed mind" })
      .expect(200);

    expect(customerService.cancelOrder).toHaveBeenCalledWith(orderId, adminUserId, "Changed mind");
    expect(response.body.data).toEqual(cancelledOrder);
  });
});