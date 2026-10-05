"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("idempotencies", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      scope: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      request_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("processing", "completed"),
        allowNull: false,
        defaultValue: "processing",
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      response_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      locked_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addConstraint("idempotencies", {
      fields: ["scope", "key"],
      type: "unique",
      name: "idempotencies_scope_key_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("idempotencies");
  },
};