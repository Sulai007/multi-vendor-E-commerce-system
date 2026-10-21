"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnRequest = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class ReturnRequest extends sequelize_1.Model {
}
exports.ReturnRequest = ReturnRequest;
ReturnRequest.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderItemId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: "orderItems", key: "id" },
        onDelete: "CASCADE",
    },
    customerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    businessId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "vendor_Businesses", key: "business_id" },
        onDelete: "CASCADE",
    },
    reasonNote: {
        type: sequelize_1.DataTypes.STRING(1000),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "returnRequest",
    tableName: "return_requests",
    underscored: true,
    indexes: [
        { unique: true, fields: ["order_item_id"] },
        { fields: ["business_id", "created_at"] },
        { fields: ["customer_id"] },
    ],
});
