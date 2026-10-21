import {
  Idempotency,
  Otp,
  Order,
  OrderItem,
  product,
  Category,
  RefreshToken,
  User,
  vendorBusiness,
} from "../src/models";

const idempotencyMigration = require("../migrations/20260925120000-create-idempotencies.js") as {
  up: (queryInterface: unknown, Sequelize: unknown) => Promise<void>;
  down: (queryInterface: unknown) => Promise<void>;
};
const productCategoriesMigration = require("../migrations/20261006120000-create-product-categories.js") as {
  up: (queryInterface: unknown, Sequelize: unknown) => Promise<void>;
  down: (queryInterface: unknown) => Promise<void>;
};
const productCategoryNamesMigration = require("../migrations/20261006130000-add-product-category-names.js") as {
  up: (queryInterface: unknown, Sequelize: unknown) => Promise<void>;
  down: (queryInterface: unknown) => Promise<void>;
};

describe("database model contracts", () => {
  it("defines idempotency uniqueness and persistence fields", () => {
    const attributes = Idempotency.getAttributes();
    const uniqueIndex = Idempotency.options.indexes?.find((index) => index.unique);

    expect(Idempotency.getTableName()).toBe("idempotencies");
    expect(attributes.key.allowNull).toBe(false);
    expect(attributes.scope.allowNull).toBe(false);
    expect(attributes.requestHash.field).toBe("request_hash");
    expect(attributes.statusCode.allowNull).toBe(true);
    expect(attributes.responseData.allowNull).toBe(true);
    expect(uniqueIndex?.fields).toEqual(["scope", "key"]);
  });

  it("registers the core user, business, and order associations", () => {
    expect(User.associations.otps.target).toBe(Otp);
    expect(User.associations.refreshTokens.target).toBe(RefreshToken);
    expect(User.associations.vendorBusiness.target).toBe(vendorBusiness);
    expect(vendorBusiness.associations.product.target).toBe(product);
    expect(Order.associations.orderItems.target).toBe(OrderItem);
    expect(OrderItem.associations.Order.target).toBe(Order);
    expect(product.associations.categories.target).toBe(Category);
    expect(Category.associations.products.target).toBe(product);
  });

  it("defines category IDs, unique names, and the product join table", () => {
    const attributes = Category.getAttributes();

    expect(Category.getTableName()).toBe("categories");
    expect(attributes.id.type.toString({})).toContain("UUID");
    expect(attributes.category.unique).toBe(true);
    expect(product.associations.categories.associationType).toBe("BelongsToMany");
  });

  it("stores product category names in a non-null array", () => {
    const categoryNames = product.getAttributes().categoryNames;

    expect(categoryNames.allowNull).toBe(false);
    expect(categoryNames.defaultValue).toEqual([]);
    expect(categoryNames.type.toString({})).toContain("[]");
  });
});

describe("product categories migration", () => {
  it("creates category and product join tables with foreign keys", async () => {
    const queryInterface = { createTable: jest.fn().mockResolvedValue(undefined) };
    const Sequelize = { UUID: "UUID", UUIDV4: "UUIDV4", STRING: "STRING", DATE: "DATE" };

    await productCategoriesMigration.up(queryInterface, Sequelize);

    expect(queryInterface.createTable).toHaveBeenNthCalledWith(1, "categories", expect.objectContaining({
      id: expect.objectContaining({ primaryKey: true }),
      category: expect.objectContaining({ unique: true }),
    }));
    expect(queryInterface.createTable).toHaveBeenNthCalledWith(2, "ProductCategory", expect.objectContaining({
      category_id: expect.objectContaining({ references: { model: "categories", key: "id" } }),
      product_id: expect.objectContaining({ references: { model: "products", key: "id" } }),
    }));
  });

  it("drops the join table before the category table when reverted", async () => {
    const queryInterface = { dropTable: jest.fn().mockResolvedValue(undefined) };

    await productCategoriesMigration.down(queryInterface);

    expect(queryInterface.dropTable).toHaveBeenNthCalledWith(1, "ProductCategory");
    expect(queryInterface.dropTable).toHaveBeenNthCalledWith(2, "categories");
  });
});

describe("product category names migration", () => {
  it("adds and backfills category names, then indexes the array", async () => {
    const queryInterface = {
      addColumn: jest.fn().mockResolvedValue(undefined),
      sequelize: { query: jest.fn().mockResolvedValue(undefined) },
      addIndex: jest.fn().mockResolvedValue(undefined),
    };
    const Sequelize = {
      ARRAY: (type: unknown) => ({ arrayOf: type }),
      STRING: (length: number) => ({ stringLength: length }),
    };

    await productCategoryNamesMigration.up(queryInterface, Sequelize);

    expect(queryInterface.addColumn).toHaveBeenCalledWith("products", "category_names", expect.objectContaining({
      allowNull: false,
      defaultValue: [],
    }));
    expect(queryInterface.sequelize.query).toHaveBeenCalledWith(expect.stringContaining("array_agg"));
    expect(queryInterface.addIndex).toHaveBeenCalledWith("products", ["category_names"], {
      name: "products_category_names_gin",
      using: "gin",
    });
  });

  it("removes the category-name index and column when reverted", async () => {
    const queryInterface = {
      removeIndex: jest.fn().mockResolvedValue(undefined),
      removeColumn: jest.fn().mockResolvedValue(undefined),
    };

    await productCategoryNamesMigration.down(queryInterface);

    expect(queryInterface.removeIndex).toHaveBeenCalledWith("products", "products_category_names_gin");
    expect(queryInterface.removeColumn).toHaveBeenCalledWith("products", "category_names");
  });
});

describe("idempotency migration", () => {
  it("creates the idempotency table with a unique scope/key constraint", async () => {
    const queryInterface = {
      createTable: jest.fn().mockResolvedValue(undefined),
      addConstraint: jest.fn().mockResolvedValue(undefined),
    };
    const Sequelize = {
      UUID: "UUID",
      STRING: (length: number) => ({ type: "STRING", length }),
      ENUM: (...values: string[]) => ({ type: "ENUM", values }),
      INTEGER: "INTEGER",
      JSONB: "JSONB",
      DATE: "DATE",
    };

    await idempotencyMigration.up(queryInterface, Sequelize);

    expect(queryInterface.createTable).toHaveBeenCalledWith("idempotencies", expect.objectContaining({
      key: expect.objectContaining({ allowNull: false }),
      scope: expect.objectContaining({ allowNull: false }),
      request_hash: expect.objectContaining({ allowNull: false }),
      status: expect.objectContaining({ allowNull: false }),
      response_data: expect.objectContaining({ type: "JSONB", allowNull: true }),
    }));
    expect(queryInterface.addConstraint).toHaveBeenCalledWith("idempotencies", {
      fields: ["scope", "key"],
      type: "unique",
      name: "idempotencies_scope_key_unique",
    });
  });

  it("drops the idempotency table when reverted", async () => {
    const queryInterface = { dropTable: jest.fn().mockResolvedValue(undefined) };

    await idempotencyMigration.down(queryInterface);

    expect(queryInterface.dropTable).toHaveBeenCalledWith("idempotencies");
  });
});