"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorBusiness = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class vendorBusiness extends sequelize_1.Model {
}
exports.vendorBusiness = vendorBusiness;
vendorBusiness.init({
    businessId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    businessName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "business",
    tableName: "vendor_Businesses",
    underscored: true,
    indexes: [{ fields: ["user_id"] }],
});
