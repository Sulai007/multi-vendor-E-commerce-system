import { getBusinessProfile } from "../src/services/vendorService";
import { User, product, vendorBusiness } from "../src/models";

jest.mock("../src/services/cacheService", () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined),
  invalidateCatalogCache: jest.fn().mockResolvedValue(undefined),
  invalidateVendorBusinessCache: jest.fn().mockResolvedValue(undefined),
}));

describe("vendor business profile", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the business owner and products when fetching a profile", async () => {
    const business = { businessId: "business-1" };
    const findByPkSpy = jest.spyOn(vendorBusiness, "findByPk").mockResolvedValue(business as never);

    await expect(getBusinessProfile("business-1")).resolves.toBe(business);

    expect(findByPkSpy).toHaveBeenCalledWith("business-1", {
      include: [
        { model: product, as: "product" },
        { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email", "role"] },
      ],
    });
    expect(jest.requireMock("../src/services/cacheService").setCache)
      .toHaveBeenCalledWith("vendor:business-1:profile", business, 600);
  });
});
