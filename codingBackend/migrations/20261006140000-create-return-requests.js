"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("return_requests", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      order_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: "orderItems", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "vendor_Businesses", key: "business_id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reason_note: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("return_requests", ["business_id", "created_at"], {
      name: "return_requests_business_created_at",
    });
    await queryInterface.addIndex("return_requests", ["customer_id"], {
      name: "return_requests_customer_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("return_requests");
  },
};
