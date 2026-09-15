"use strict";

/**
 * Remove the foreign key created by the old vendorID association.
 * The corrected models use products.business_id -> vendor_Businesses.business_id.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "products_vendor_i_d_fkey";
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "products_vendor_i_d";
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "products_vendor_i_d_fkey"
      FOREIGN KEY ("vendor_i_d")
      REFERENCES "vendor_Businesses" ("id")
      ON DELETE CASCADE;
    `);
  },
};
