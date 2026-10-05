"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    customerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" }
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.00,
    },
    orderStatus: {
        type: sequelize_1.DataTypes.ENUM("pending", "processed", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM("unpaid", "paid"),
        allowNull: false,
        defaultValue: "unpaid"
    },
    shippingAddress: {
        type: sequelize_1.DataTypes.STRING(256),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE(),
    updatedAt: sequelize_1.DataTypes.DATE()
}, {
    sequelize: db_1.sequelize,
    modelName: "Order",
    tableName: "orders",
    underscored: true
});
