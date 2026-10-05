"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    orderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "orders", key: "id" }
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE"
    },
    businessId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "vendor_Businesses", key: "business_id" },
        onDelete: "CASCADE"
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    unitPrice: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    itemStatus: {
        type: sequelize_1.DataTypes.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
    },
    refundStatus: {
        type: sequelize_1.DataTypes.ENUM("none", "requested", "processing", "refunded", "rejected"),
        allowNull: false,
        defaultValue: "none"
    },
    createdAt: sequelize_1.DataTypes.DATE(),
    updatedAt: sequelize_1.DataTypes.DATE()
}, {
    sequelize: db_1.sequelize,
    modelName: "orderItem",
    tableName: "orderItems",
    underscored: true
});
