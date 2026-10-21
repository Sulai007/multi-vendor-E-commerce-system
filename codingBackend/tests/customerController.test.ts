import * as customerController from "../src/controllers/customerController";
import * as customerService from "../src/services/customerService";

jest.mock("../src/services/customerService", () => ({
  addOrderItem: jest.fn(),
  createOrder: jest.fn(),
  requestRefund: jest.fn(),
  cancelOrder: jest.fn(),
  getBusinesses: jest.fn(),
  getBusinessById: jest.fn(),
  getBusinessProducts: jest.fn(),
  getProductsByCategory: jest.fn(),
  getBusinessProductById: jest.fn(),
  searchProducts: jest.fn(),
}));

describe("customer controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("passes the numeric quantity to addOrderItem", async () => {
    const addOrderItemMock = jest.mocked(customerService.addOrderItem).mockResolvedValue({ id: "item-1" } as never);
    const req = {
      params: { orderid: "order-1", prodId: "product-1" },
      body: { qty: 3 },
      user: { sub: "customer-1" },
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await customerController.addToOrder(req, res, jest.fn());

    expect(addOrderItemMock).toHaveBeenCalledWith("order-1", "product-1", 3);
  });
});
