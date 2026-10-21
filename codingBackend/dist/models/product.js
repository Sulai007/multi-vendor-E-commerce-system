"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.product = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class product extends sequelize_1.Model {
}
exports.product = product;
product.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    businessId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "vendor_Businesses", key: "business_id" },
        onDelete: "CASCADE",
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: false,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    imagePublicId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    categoryNames: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING(255)),
        allowNull: false,
        defaultValue: [],
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "hidden", "archived"),
        allowNull: false,
        defaultValue: "active",
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "product",
    tableName: "products",
    underscored: true,
    indexes: [{ fields: ["business_id"] }],
});
