"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "category_names", {
      type: Sequelize.ARRAY(Sequelize.STRING(255)),
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.sequelize.query(`
      UPDATE "products" AS product
      SET "category_names" = COALESCE(
        (
          SELECT array_agg(category."category" ORDER BY category."category")
          FROM "ProductCategory" AS product_category
          JOIN "categories" AS category ON category."id" = product_category."category_id"
          WHERE product_category."product_id" = product."id"
        ),
        ARRAY[]::VARCHAR(255)[]
      );
    `);

    await queryInterface.addIndex("products", ["category_names"], {
      name: "products_category_names_gin",
      using: "gin",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("products", "products_category_names_gin");
    await queryInterface.removeColumn("products", "category_names");
  },
};
