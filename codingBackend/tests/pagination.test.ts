import { getPagination, getPaginationMetadata } from "../src/utils/pagination";

describe("pagination helpers", () => {
  it("uses page 1 and limit 10 when values are missing", () => {
    expect(getPagination(undefined, undefined)).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
    });
  });

  it("calculates the database offset", () => {
    expect(getPagination("3", "20")).toEqual({
      page: 3,
      limit: 20,
      offset: 40,
    });
  });

  it("uses defaults for invalid values and caps the maximum limit", () => {
    expect(getPagination("0", "not-a-number")).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
    });
    expect(getPagination("2", "500")).toEqual({
      page: 2,
      limit: 100,
      offset: 100,
    });
  });

  it("returns total item and page counts", () => {
    expect(getPaginationMetadata(2, 10, 25)).toEqual({
      page: 2,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
    });
    expect(getPaginationMetadata(1, 10, 0).totalPages).toBe(0);
  });
});